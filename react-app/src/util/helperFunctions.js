export const parseMessage = (msg) => {
    const encodedMessage = JSON.parse(msg).payload
    const messageId = JSON.parse(msg).messageId
    const decodedMessage = atob(encodedMessage)

    if (decodedMessage.length === 0) {
        return { newData: {}, messageId }
    }
    const newData = JSON.parse(decodedMessage)
    return { newData, messageId }
}

export const sleep = async (timeInMilliseconds) => {
    await new Promise((r) => setTimeout(r, timeInMilliseconds))
}

export const getPastOneHourEmptyChartData = () => {
    const past1HourTimeStamp = new Date(
        new Date(new Date().setHours(new Date().getHours() - 1)).setSeconds(0),
    ).setMilliseconds(0)

    let chartData = []

    for (let i = 0; i < 600; i++) {
        chartData.push({
            x: new Date(past1HourTimeStamp).setSeconds(new Date(past1HourTimeStamp).getSeconds() + i * 10),
            y: NaN,
        })
    }
    return chartData
}
