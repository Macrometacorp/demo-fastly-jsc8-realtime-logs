import jsC8 from "jsc8"
import { streamAppNames } from "../../util/constants"
import config from "./serviceConfig"

const jsc8Client = new jsC8({
    url: config.gdnURL,
    apiKey: config.apiKey,
})

const activateStreamApp = async (steamsApps, active) => {
    try {
        for (const app of steamsApps) {
            await jsc8Client.activateStreamApp(app, active)
        }
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
            `${streamName}-${Math.round(Math.random() * 1000)}`,
            false,
            false,
            config.gdnURL.replace("https://", ""),
        )
    } catch (error) {
        console.error(error)
    }
    return response
}
