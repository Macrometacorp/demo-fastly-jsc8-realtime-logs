import { makeStyles, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import _ from "lodash"
import { useCallback, useEffect, useRef } from "react"
import { getPastOneHourEmptyChartData } from "../../../util/helperFunctions"

const useStyles = makeStyles({
    root: {
        paddingTop: "1rem",
    },
})

const ResponseLatencyStatsChart = ({ stats, clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)

    const getChartData = useCallback((chartData) => {
        return _.chain(chartData)
            .groupBy("response_status")
            .map((stat, key) => {
                const _chartData = getPastOneHourEmptyChartData()
                const data = _chartData.map((_data) => {
                    const minuteStats = _.filter(stat, ["request_10sec_timeframe", _data.x])
                    return {
                        x: new Date(_data.x),
                        y: minuteStats.length ? Math.floor(minuteStats[0].latency) : _data.y,
                    }
                })

                let color
                switch (key) {
                    case "200":
                        color = "rgba(64, 81, 181, 1)"
                        break
                    case "201":
                        color = "rgba(64, 81, 181, 0.7)"
                        break
                    case "202":
                        color = "rgba(64, 81, 181, 0.4)"
                        break
                    case "304":
                        color = "rgba(191, 191, 43, 0.8)"
                        break
                    case "400":
                        color = "rgba(230, 103, 103, 0.6)"
                        break
                    case "401":
                        color = "rgba(230, 103, 103, 0.6)"
                        break
                    case "404":
                        color = "rgba(230, 103, 103, 1)"
                        break
                    default:
                        color = "rgba(64, 81, 181, 0.2)"
                        break
                }

                return {
                    label: key,
                    data: data,
                    backgroundColor: color,
                    borderColor: color,
                    spanGaps: false,
                    borderWidth: 2,
                    pointRadius: 1,
                    lineTension: 0.7, // disables curves
                }
            })
            .value()
    }, [])

    useEffect(() => {
        if (!chartRef.current && chartDomRef.current) {
            chartRef.current = new Chart(chartDomRef.current, {
                type: "line",
                data: {
                    datasets: [],
                },
                options: {
                    interaction: {
                        intersect: false,
                        mode: "index",
                    },
                    plugins: {
                        title: {
                            display: false,
                        },
                        legend: {
                            position: "bottom",
                        },
                        tooltip: {
                            callbacks: {
                                label: ({ dataset, formattedValue }) => {
                                    return `${dataset.label}: ${formattedValue}ms`
                                },
                            },
                        },
                    },
                    scales: {
                        x: {
                            type: "realtime",
                            realtime: {
                                duration: 900000,
                                delay: 2000,
                            },
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            ticks: {
                                callback: (value, index, values) => {
                                    return `${value}ms`
                                },
                            },
                        },
                    },
                },
            })
        }
    }, [])

    useEffect(() => {
        if (chartRef.current && stats.length) {
            let chartData = stats.reduce((_chartData, stat) => {
                if (Array.isArray(stat)) {
                    stat.forEach((curr) => {
                        _chartData.push(curr.event)
                    })
                } else if (typeof stat === "object" && stat && stat.event) {
                    _chartData.push(stat.event)
                } else {
                    _chartData.push(stat)
                }
                return _chartData
            }, [])

            chartData = getChartData(chartData)

            if (!chartRef.current.data.datasets.length) {
                chartRef.current.data.datasets = chartData
            } else {
                const datasets = chartRef.current.data.datasets

                datasets.forEach((dataset) => {
                    const _dataset = _.filter(chartData, ["label", dataset.label])

                    if (_dataset.length) {
                        dataset.data = _dataset[0].data
                    }
                })

                chartData.forEach((data) => {
                    const _data = _.filter(datasets, ["label", data.label])

                    if (!_data.length) {
                        datasets.push(data)
                    }
                })
            }

            chartRef.current.update("none")
        }
    }, [getChartData, stats])

    useEffect(() => {
        if (clearChart) {
            chartRef.current.data.datasets = []
            chartRef.current.update()
        }
    }, [clearChart])

    return (
        <>
            <Typography variant="subtitle1" align="left">
                Http Response Latency (by status code)
            </Typography>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default ResponseLatencyStatsChart
