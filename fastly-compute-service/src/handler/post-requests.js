import { getEnv } from "../fastly"
import { DICTIONARY_ITEM_KEYS, GDN_API_PATHS, REQUEST_METHODS } from "../utils/constant"
import { request } from "./request"

// API_PATHS.COLLECTION_QUERY
export const getDocument = async (queryParams, response, logMessage) => {
    const startTime = new Date()
    let contentLength = 0
    response.status = 404
    response.body = "{}"

    try {
        const restQl = queryParams.has("query") ? queryParams.get("query") : "fastlyGetQuery"
        let bindVars = {}

        if (queryParams.has("name")) {
            bindVars = { name: queryParams.get("name") }
        }

        console.log(JSON.stringify(bindVars))
        const requestUrl = `${getEnv(DICTIONARY_ITEM_KEYS.API_URL)}${GDN_API_PATHS.EXECUTE_RESTQL}/${restQl}`
        const apiResponse = await request(requestUrl, REQUEST_METHODS.POST, JSON.stringify({ bindVars }))

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
