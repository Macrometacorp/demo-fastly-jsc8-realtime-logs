import jsC8 from "jsc8"
import { collections } from "../../util/constants"
import config from "./serviceConfig"

const jsc8Client = new jsC8({
    url: config.gdnURL,
    apiKey: config.apiKey,
})

export const truncateAllCollections = async () => {
    try {
        const promises = collections.map((collection) => jsc8Client.collection(collection).truncate())
        await Promise.all(promises)
        await jsc8Client.deleteCollection("fastly_users")
    } catch (error) {
        console.error("Failed to truncate", error.message)
    }
}

const fetchNextBatch = async (cursorId, previousResult = []) => {
    try {
        const fetchPromise = await fetch(
            `${jsc8Client._connection._urls[0]}/_fabric/_system/_api/restql/fetch/${cursorId}`,
            {
                method: "PUT",
                headers: jsc8Client._connection._headers,
            },
        )

        const { result, hasMore, id } = await fetchPromise.json()
        previousResult = [...previousResult, ...result]

        if (!hasMore) {
            return previousResult
        }

        return await fetchNextBatch(id, previousResult)
    } catch (error) {
        return previousResult
    }
}

export const executeRestql = async (name, params = {}) => {
    let restqlResponse = []
    try {
        const { result, hasMore, id } = await jsc8Client.executeRestql(name, params)
        if (!hasMore) {
            return result
        }

        restqlResponse = await fetchNextBatch(id, result)
        return restqlResponse
    } catch (error) {
        console.error(`Failed to ${name}`, error.message)
        return restqlResponse
    }
}
