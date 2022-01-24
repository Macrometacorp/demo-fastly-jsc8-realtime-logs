import { makeStyles, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import _ from "lodash"
import { useCallback, useEffect, useRef } from "react"
import useInterval from "../../../hooks/useInterval"
import { restQlNames } from "../../../util/constants"
import { executeRestql } from "../../services/restqlService"

const useStyles = makeStyles({
    root: {
        height: "19rem",
    },
})

const TopErrorUrlsChart = ({ clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)

    const updateChart = (labels, data) => {
        chartRef.current.data.labels = labels
        chartRef.current.data.datasets[0] = {
            data,
            barThickness: 48,
            backgroundColor: ["rgba(93, 108, 192, 0.3)"],
        }
        chartRef.current.update()
    }

    const getStats = useCallback(async () => {
        try {
            let result = await executeRestql(restQlNames.getTopErrorByUrlPath, {
                topN: 7,
            })
            const sortedResponseCodeRatioData = _.orderBy(result, ["count"], ["desc"])
            const url = _.map(sortedResponseCodeRatioData, "url")
            const count = _.map(sortedResponseCodeRatioData, "count")

            updateChart(url, count)
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        if (!chartRef.current && chartDomRef.current) {
            chartRef.current = new Chart(chartDomRef.current, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [],
                },
                plugins: [ChartDataLabels],
                options: {
                    indexAxis: "y",
                    responsive: true,
                    plugins: {
                        legend: false,
                        datalabels: {
                            color: "#00000",
                            align: "end",
                            anchor: "start",
                            formatter: function (value, context) {
                                return context.chart.data.labels[context.dataIndex]
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                display: false,
                                autoSkip: false,
                            },
                        },
                        y: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                callback: (value, index, values) => {
                                    const yLabel = chartRef.current.data.datasets[0].data[index]
                                    return `${
                                        yLabel > 49 ? `${(yLabel / 1000).toFixed(1).replace(/\.0$/, "")}K` : yLabel
                                    }`
                                },
                                display: true,
                                autoSkip: false,
                            },
                        },
                    },
                },
            })
        }
    }, [])

    useEffect(() => {
        if (clearChart) {
            chartRef.current.data.labels = []
            chartRef.current.data.datasets = []
            chartRef.current.update()
        }
    }, [clearChart])

    useEffect(() => {
        if (chartRef.current) {
            getStats()
        }
    }, [getStats])

    useInterval(getStats, 10000)

    return (
        <>
            <Typography variant="subtitle1" align="left">
                Top Errors (by URL)
            </Typography>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default TopErrorUrlsChart
