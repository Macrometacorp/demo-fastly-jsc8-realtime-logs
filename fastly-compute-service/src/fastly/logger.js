import { DICTIONARY_ITEM_KEYS, GMT_OFFSET_REGEX } from "../utils/constant"
import { padZero } from "../utils/utils"
import { getEnv } from "./dictionaries"

let logger

const getFSLogger = (key) => {
    if (!logger) {
        const endpointName = getEnv(key)
        logger = fastly.getLogger(endpointName)
    }

    return logger
}

export const log = (message) => {
    // timestamp format "2022-01-19T20:10:04+0530"
    const date = new Date()
    const gmtOffset = GMT_OFFSET_REGEX.exec(date.toTimeString())[1]
    const timestamp = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())}\
T${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}${gmtOffset}`

    const logger = getFSLogger(DICTIONARY_ITEM_KEYS.LOGGING)
    logger.log(
        JSON.stringify({
            timestamp,
            ...message,
        }),
    )
}
