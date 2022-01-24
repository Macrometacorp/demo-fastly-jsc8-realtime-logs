const getBodyParameters = async (body) => {
    const reader = body.getReader()
    const decoder = new TextDecoder()
    let data = ""

    while (true) {
        const { done, value } = await reader.read()
        const chunkStr = decoder.decode(value)
        data += chunkStr

        if (done) {
            break
        }
    }

    return JSON.parse(data)
}

export const parseRequest = (event) => {
    const headers = event.headers
    const method = event.request.method
    const url = new URL(event.request.url)
    const queryParams = url.searchParams
    const ip = event.client.address || "127.0.0.1"
    const geo = event.client.geo

    return {
        url,
        headers,
        method,
        queryParams,
        ip,
        geo,
    }
}

export const padZero = (number) => {
    return `0${number}`.slice(-2)
}

export const generateRandomNumber = (max, min) => {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
