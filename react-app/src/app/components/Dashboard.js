import { Container, Grid, makeStyles } from "@material-ui/core"
import React, { useEffect, useState } from "react"
import { collections, restQlNames, streamNames } from "../../util/constants"
import { parseMessage, sleep } from "../../util/helperFunctions"
import { executeRestql, truncateAllCollections } from "../services/restqlService"
import { createStreamReader, startStreamApps, stopStreamApps } from "../services/streamsService"
import ButtonBar from "./ButtonBar"
import Header from "./Header"
import ResponseCodeRatioChart from "./restqlCharts/ResponseCodeRatioChart"
import TopErrorUrlsChart from "./restqlCharts/TopErrorUrlsChart"
import TopUrlsChart from "./restqlCharts/TopUrlsChart"
import UniqueVisitorsChart from "./restqlCharts/UniqueVisitorsChart"
import ReponseSizeStatsChart from "./streamCharts/ReponseSizeStatsChart"
import ResponseCodeStatsChart from "./streamCharts/ResponseCodeStatsChart"
import ResponseLatencyStatsChart from "./streamCharts/ResponseLatencyStatsChart"

const useStyles = makeStyles({
    root: {
        backgroundColor: "#F1F2F4",
        margin: 0,
        minHeight: "100vh",
        padding: "0 0 1rem",
    },
    gridContainer: {
        margin: 0,
        padding: "0 0.75rem",
    },
    gridRow: {
        marginTop: "1rem",
    },
    gridCell: {
        padding: "0.25rem",
    },
    chartWrapper: {
        backgroundColor: "#FFF",
        border: "1px solid rgba(197, 200, 209, .5)",
        borderRadius: "4px",
        padding: "0.5rem 1rem",
    },
})

const Dashboard = () => {
    const classes = useStyles()

    const [isLoading, setIsLoading] = useState(false)
    const [isStopLoading, setIsStopLoading] = useState(false)
    const [isClearLoading, setIsClearLoading] = useState(false)
    const [isStreamStarted, setIsStreamStarted] = useState(false)
    const [streamConnections, setStreamConnections] = useState([])

    const [responseCodeStatsData, setResponseCodeStatsData] = useState([])
    const [responseLatencyStatsData, setResponseLatencyStatsData] = useState([])
    const [responseSizeStatsData, setResponseSizeStatsData] = useState([])

    const handleClose = (event) => {
        event.preventDefault()
        handleOnStop()
        // This is opening alert message
        event.returnValue = ""
        return ""
    }

    useEffect(() => {
        window.addEventListener("beforeunload", handleClose)
        const getInitialChartData = async () => {
            const _responseSizeStatsData = await executeRestql(restQlNames.getStatsByCollection, {
                "@collection": collections[1],
            })
            const _responseCodeStatsData = await executeRestql(restQlNames.getStatsByCollection, {
                "@collection": collections[2],
            })
            const _responseLatencyStatsData = await executeRestql(restQlNames.getStatsByCollection, {
                "@collection": collections[3],
            })

            setResponseSizeStatsData(_responseSizeStatsData)
            setResponseCodeStatsData(_responseCodeStatsData)
            setResponseLatencyStatsData(_responseLatencyStatsData)
        }

        getInitialChartData()
        return () => {
            window.removeEventListener("beforeunload", handleClose)
        }
    }, [])

    const messageManipulation = (message, streamName) => {
        let tempArr = []
        const { newData } = parseMessage(message)
        if (!newData || !Object.keys(newData).length) {
            return
        }

        tempArr.push(newData)
        // eslint-disable-next-line
        switch (streamName) {
            case streamNames.responseCodeStatsStream:
                setResponseCodeStatsData((prev) => [...tempArr, ...prev])
                break
            case streamNames.responseLatencyStatsStream:
                setResponseLatencyStatsData((prev) => [...tempArr, ...prev])
                break
            case streamNames.responseSizeStatsStream:
                setResponseSizeStatsData((prev) => [...tempArr, ...prev])
                break
        }
    }

    const establishSocketConnection = async (streamName) => {
        try {
            const _consumer = await createStreamReader(streamName)
            _consumer.on("open", () => console.log(`Connection open for ${streamName}`))
            _consumer.on("error", (error) => console.error(`Connection error for ${streamName}`, error))
            _consumer.on("close", () => console.log(`Connection close for ${streamName}`))

            _consumer.on("message", (message) => {
                _consumer.send(JSON.stringify({ messageId: JSON.parse(message).messageId }))

                messageManipulation(message, streamName)
            })
            return _consumer
        } catch (error) {
            console.error("error", error)
        }
    }

    const startStreamAppAndStremWs = async () => {
        const response = await startStreamApps()
        if (response) {
            await sleep(1000)
            const responseCodeStatsWsConn = await establishSocketConnection(streamNames.responseCodeStatsStream)
            await sleep(1000)
            const responseLatencyStatsWsConn = await establishSocketConnection(streamNames.responseLatencyStatsStream)
            await sleep(1000)
            const responseSizeStatsWsConn = await establishSocketConnection(streamNames.responseSizeStatsStream)

            setStreamConnections((prev) => [
                ...prev,
                responseCodeStatsWsConn,
                responseLatencyStatsWsConn,
                responseSizeStatsWsConn,
            ])
            setIsStreamStarted(true)
        }
        setIsLoading(false)
    }

    const stopStreamAppAndStremWs = async () => {
        for (const stream of streamConnections) {
            await stream.terminate()
        }

        const response = await stopStreamApps()
        if (response) {
            setIsStreamStarted(false)
        }
        setIsStopLoading(false)
    }

    const clearCollections = async () => {
        await truncateAllCollections()
        setIsClearLoading(false)
    }

    const handleOnStart = () => {
        setIsLoading(true)
        startStreamAppAndStremWs()
    }

    const handleOnStop = () => {
        setIsStopLoading(true)
        stopStreamAppAndStremWs()
    }

    const handleOnClearTable = () => {
        setIsClearLoading(true)
        setResponseCodeStatsData([])
        setResponseLatencyStatsData([])
        setResponseSizeStatsData([])
        clearCollections()
    }

    return (
        <Container className={classes.root} maxWidth={false}>
            <Header />

            <ButtonBar
                isStreamStarted={isStreamStarted}
                handleOnStart={handleOnStart}
                isStartButtonDisabled={isLoading}
                handleOnStop={handleOnStop}
                isStopButtonDisabled={isStopLoading}
                handleOnClear={handleOnClearTable}
                isClearButtonDisabled={isClearLoading}
            />

            <Grid
                className={classes.gridContainer}
                container={true}
                direction="row"
                alignItems="flex-start"
                spacing={0}
            >
                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <ResponseCodeStatsChart stats={responseCodeStatsData} clearChart={isClearLoading} />
                    </div>
                </Grid>
                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <ResponseLatencyStatsChart stats={responseLatencyStatsData} clearChart={isClearLoading} />
                    </div>
                </Grid>
                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <ReponseSizeStatsChart stats={responseSizeStatsData} clearChart={isClearLoading} />
                    </div>
                </Grid>
            </Grid>

            <Grid
                className={classes.gridContainer}
                container={true}
                direction="row"
                alignItems="flex-start"
                spacing={0}
            >
                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <TopErrorUrlsChart clearChart={isClearLoading} />
                    </div>
                </Grid>

                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <TopUrlsChart clearChart={isClearLoading} />
                    </div>
                </Grid>

                <Grid className={classes.gridCell} item xs={4}>
                    <div className={classes.chartWrapper}>
                        <Grid container={true} direction="row" alignItems="flex-start">
                            <Grid item xs={6}>
                                <UniqueVisitorsChart clearChart={isClearLoading} />
                            </Grid>
                            <Grid item xs={6}>
                                <ResponseCodeRatioChart clearChart={isClearLoading} />
                            </Grid>
                        </Grid>
                    </div>
                </Grid>
            </Grid>
        </Container>
    )
}

export default Dashboard
