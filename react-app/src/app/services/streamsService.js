import jsC8 from "jsc8"
import { streamAppNames } from "../../util/constants"
import config from "./serviceConfig"

const jsc8Client = new jsC8({
    url: config.gdnURL,
    apiKey: config.apiKey,
})

const activateStreamApp = async (steamsApps, active) => {
    const streamPromises = []
    try {
        steamsApps.forEach((app) => {
            streamPromises.push(jsc8Client.activateStreamApp(app, active))
        })
        await Promise.all(streamPromises)
        return true
    } catch (error) {
        console.error("Failed start or stop streams", error.message)
        return false
    }
}

export const startStreamApps = async () => {
    return await activateStreamApp(streamAppNames, true)
}

export const stopStreamApps = async () => {
    const streamApps = streamAppNames.reverse()
    return await activateStreamApp(streamApps, false)
}

export const createStreamReader = async (streamName) => {
    let response
    try {
        response = await jsc8Client.createStreamReader(
            streamName,
            `${streamName}`,
            false,
            false,
            config.gdnURL.replace("https://", ""),
        )
    } catch (error) {
        console.error(error)
    }
    return response
}
