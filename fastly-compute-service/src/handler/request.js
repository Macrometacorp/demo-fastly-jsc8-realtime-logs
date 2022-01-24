import { getEnv } from "../fastly"
import { DICTIONARY_ITEM_KEYS } from "../utils/constant"

const getHeaders = (key) => {
    const apiKey = getEnv(key)
    return {
        headers: {
            Authorization: `apikey ${apiKey}`,
        },
    }
}

const getBackend = (key) => {
    const backendName = getEnv(key)
    return {
        backend: backendName,
    }
}

export const request = async (url, method, body = "{}") => {
    const headers = getHeaders(DICTIONARY_ITEM_KEYS.API_KEY)
    const backend = getBackend(DICTIONARY_ITEM_KEYS.BACKEND)

    const requestInit = {
        method,
        body,
        ...backend,
        ...headers,
    }

    if (method === "GET") {
        delete requestInit.body
    }

    return await fetch(url, requestInit)
}
