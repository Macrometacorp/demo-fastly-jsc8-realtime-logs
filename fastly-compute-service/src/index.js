import { log } from "./fastly"
import { createCollectionWithSeedData, getDocument, getDocuments, insertDocuments, updateDocuments } from "./handler"
import { API_PATHS, REQUEST_METHODS } from "./utils/constant"
import { parseRequest } from "./utils/utils"

addEventListener("fetch", (event) => event.respondWith(handleRequest(event)))

async function handleRequest(event) {
    // Get the client request.
    let { url, headers, method, queryParams, ip, geo } = parseRequest(event)

    if (!Object.values(REQUEST_METHODS).includes(method)) {
        return new Response("This method is not allowed!", {
            status: 405,
        })
    }

    if (
        method === REQUEST_METHODS.OPTIONS &&
        headers.has("Origin") &&
        (headers.has("access-control-request-headers") || headers.has("access-control-request-method"))
    ) {
        return new Response(null, {
            status: 204,
            headers: {
                "access-control-allow-origin": headers.get("origin") || "",
                "access-control-allow-methods": "GET,HEAD,POST,OPTIONS",
                "access-control-allow-headers": headers.get("access-control-request-headers") || "",
                "access-control-max-age": 86400,
            },
        })
    }

    let response = {
        status: 200,
        body: "",
    }
    let logMessage = {
        request_method: method,
        response_status: 200,
        url: url.pathname,
        response_body_size: 0,
        time_elapsed: 0,
        geo_country: geo.country_name,
        client_ip: ip,
    }

    switch (method) {
        case REQUEST_METHODS.GET:
            if (url.pathname === API_PATHS.INIT) {
                response = await createCollectionWithSeedData(response)
                break
            }

            if (url.pathname === API_PATHS.COLLECTION_KEY) {
                ;({ response, logMessage } = await getDocuments(queryParams, response, logMessage))
                break
            }
        case REQUEST_METHODS.POST:
            if (url.pathname === API_PATHS.COLLECTION_QUERY) {
                ;({ response, logMessage } = await getDocument(queryParams, response, logMessage))
                break
            }
        case REQUEST_METHODS.PUT:
            if (url.pathname === API_PATHS.DOCUMENT) {
                ;({ response, logMessage } = await updateDocuments(response, logMessage))
            }
            break
        default:
            response.status = 404
            response.body = { message: "The page you requested could not be found" }
            break
    }

    if (url.pathname !== API_PATHS.INIT) {
        log(logMessage)
    }

    return new Response(response.body, {
        status: response.status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
        },
    })
}
