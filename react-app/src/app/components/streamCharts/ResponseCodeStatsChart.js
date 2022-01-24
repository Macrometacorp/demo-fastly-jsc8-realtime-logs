import { makeStyles, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import _ from "lodash"
import { useCallback, useEffect, useRef } from "react"

const useStyles = makeStyles({
    root: {
        paddingTop: "1rem",
    },
})

const ResponseCodeStatsChart = ({ stats, clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)

    const getChartData = useCallback((chartData) => {
        return _.chain(chartData)
            .groupBy("response_status")
            .map((stat, key) => {
                const _value = stat.map((_stat) => {
                    return {
                        x: new Date(_stat.request_10sec_timeframe),
                        y: _stat.count,
                    }
                })

                let backgroundColor
                switch (key) {
                    case "200":
                        backgroundColor = "rgba(64, 81, 181, 1)"
                        break
                    case "201":
                        backgroundColor = "rgba(64, 81, 181, 0.7)"
                        break
                    case "202":
                        backgroundColor = "rgba(64, 81, 181, 0.4)"
                        break
                    case "304":
                        backgroundColor = "rgba(191, 191, 43, 0.8)"
                        break
                    case "400":
                        backgroundColor = "rgba(230, 103, 103, 0.6)"
                        break
                    case "401":
                        backgroundColor = "rgba(230, 103, 103, 0.6)"
                        break
                    case "404":
                        backgroundColor = "rgba(230, 103, 103, 1)"
                        break
                    default:
                        backgroundColor = "rgba(64, 81, 181, 0.2)"
                        break
                }
                return {
                    label: key,
                    data: _value,
                    backgroundColor,
                }
            })
            .value()
    }, [])

    useEffect(() => {
        if (!chartRef.current && chartDomRef.current) {
            chartRef.current = new Chart(chartDomRef.current, {
                type: "bar",
                data: {
                    datasets: [],
                },
                options: {
                    plugins: {
                        title: {
                            display: false,
                        },
                        legend: {
                            position: "bottom",
                        },
                    },
                    scales: {
                        x: {
                            stacked: true,
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
                            stacked: true,
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
                Http Response Count (by status code)
            </Typography>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default ResponseCodeStatsChart
