import { getEnv } from "../fastly"
import {
    COLLECTION_NAME,
    DICTIONARY_ITEM_KEYS,
    GDN_API_PATHS,
    REQUEST_METHODS,
    RESTQL_QUERIES,
} from "../utils/constant"
import { seedData } from "../utils/dataset"
import { generateRandomNumber } from "../utils/utils"
import { request } from "./request"

// API_PATHS.INIT
export const createCollectionWithSeedData = async (response) => {
    try {
        const requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${GDN_API_PATHS.COLLECTION}`
        const requestBody = JSON.stringify({
            name: COLLECTION_NAME,
            isSystem: true,
            keyOptions: {
                allowUserKeys: false,
                type: "uuid",
            },
        })
        const apiResponse = await request(requestUrl, REQUEST_METHODS.POST, requestBody)
        const parsedApiResponse = await apiResponse.json()

        if (!parsedApiResponse.error) {
            const randomNumber = generateRandomNumber(157, 101)
            const requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${
                GDN_API_PATHS.DOCUMENT
            }/${COLLECTION_NAME}?returnNew=false&returnOld=false&silent=true&overwrite=false`
            const promises = seedData
                .slice(0, randomNumber)
                .map((data) => request(requestUrl, REQUEST_METHODS.POST, JSON.stringify(data)))
            await Promise.all(promises)
        }

        response.status = apiResponse.status
        response.body = JSON.stringify(parsedApiResponse || {})
    } catch (error) {
        response.status = 400
        response.body = JSON.stringify({ message: error.message || "Bad request" })
    }

    return response
}

// API_PATHS.COLLECTION_KEY
export const getDocuments = async (queryParams, response, logMessage) => {
    const startTime = new Date()
    let contentLength = 0
    response.status = 404
    response.body = "{}"

    try {
        const errorParam = queryParams.has("error") ? JSON.parse(queryParams.get("error")) : false

        if (!errorParam) {
            const requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${GDN_API_PATHS.EXECUTE_RESTQL}/${
                RESTQL_QUERIES.GET_DOCUMENT
            }`
            const requestBody = JSON.stringify({
                bindVars: {
                    offset: generateRandomNumber(17, 7),
                },
            })
            const apiResponse = await request(requestUrl, REQUEST_METHODS.POST, requestBody)
            const parsedApiResponse = await apiResponse.json()

            response.body = JSON.stringify(parsedApiResponse)
            response.status = apiResponse.status === 201 ? 200 : apiResponse.status
            contentLength = apiResponse.headers.get("Content-Length")
        }
    } catch (error) {
        response.status = 400
        response.body = JSON.stringify({ message: error.message || "Bad request" })
    }

    logMessage.response_status = response.status
    logMessage.response_body_size = Number(contentLength) || 0
    logMessage.time_elapsed = new Date() - startTime
    return { response, logMessage }
}
