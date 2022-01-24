import { getEnv } from "../fastly"
import {
    COLLECTION_NAME,
    DICTIONARY_ITEM_KEYS,
    GDN_API_PATHS,
    REQUEST_METHODS,
    RESTQL_QUERIES,
} from "../utils/constant"
import { generateRandomNumber } from "../utils/utils"
import { request } from "./request"

// API_PATHS.DOCUMENT
export const updateDocuments = async (response, logMessage) => {
    const startTime = new Date()
    let contentLength = 0
    response.status = 404
    response.body = "{}"

    try {
        let requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${GDN_API_PATHS.EXECUTE_RESTQL}/${
            RESTQL_QUERIES.GET_DOCUMENT
        }`
        const requestBody = JSON.stringify({
            bindVars: {
                offset: generateRandomNumber(300, 1),
            },
        })
        let apiResponse = await request(requestUrl, REQUEST_METHODS.POST, requestBody)
        const { result } = await apiResponse.json()
        const updatedDataSet = result.map((data) => {
            return { ...data, timestamp: new Date().getTime() }
        })

        requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${GDN_API_PATHS.DOCUMENT}/${COLLECTION_NAME}`
        apiResponse = await request(requestUrl, REQUEST_METHODS.PUT, JSON.stringify(updatedDataSet))
        const parsedApiResponse = await apiResponse.json()

        response.body = JSON.stringify(parsedApiResponse)
        response.status = apiResponse.status
        contentLength = apiResponse.headers.get("Content-Length")
    } catch (error) {
        response.status = 400
        response.body = JSON.stringify({ message: error.message || "Bad request" })
    }

    logMessage.response_status = response.status
    logMessage.response_body_size = Number(contentLength) || 0
    logMessage.time_elapsed = new Date() - startTime
    return { response, logMessage }
}
