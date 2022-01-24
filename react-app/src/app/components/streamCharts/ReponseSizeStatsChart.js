import { FormControl, Grid, InputLabel, makeStyles, MenuItem, Select, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import _ from "lodash"
import { useEffect, useState, useRef, useCallback } from "react"
import { getPastOneHourEmptyChartData } from "../../../util/helperFunctions"

const useStyles = makeStyles({
    root: {},
    select: {
        width: "100%",
    },
})

const ReponseSizeStatsChart = ({ stats, clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)
    const [reponseSizeStats, setReponseSizeStats] = useState([])
    const [filterUrls, setFilterUrls] = useState([])
    const [selectedUrl, setSelectedUrl] = useState("All")

    const getChartData = useCallback((chartData) => {
        return _.chain(chartData)
            .groupBy("url")
            .map((stat, key) => {
                const _chartData = getPastOneHourEmptyChartData()
                const data = _chartData.map((_data) => {
                    const minuteStats = _.filter(stat, ["request_10sec_timeframe", _data.x])
                    return {
                        x: new Date(_data.x),
                        y: minuteStats.length ? Math.floor(minuteStats[0].response_body_size) : _data.y,
                    }
                })

                return {
                    label: key,
                    data: data,
                    borderColor: "rgba(93, 108, 192, 0.6)",
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
                        mode: "index",
                    },
                    plugins: {
                        legend: false,
                        title: {
                            display: false,
                        },
                        tooltip: {
                            itemSort: ({ parsed: i0 }, { parsed: i1 }) => {
                                return i1.y - i0.y
                            },
                            callbacks: {
                                label: ({ dataset, formattedValue }) => {
                                    return `${dataset.label}: ${formattedValue}b`
                                },
                            },
                            backgroundColor: "#000",
                        },
                    },
                    scales: {
                        x: {
                            type: "realtime",
                            realtime: {
                                duration: 900000,
                                refresh: 12000,
                                delay: 2000,
                            },
                            grid: {
                                display: false,
                            },
                        },
                        y: {
                            ticks: {
                                callback: (value, index, values) => {
                                    return `${value}b`
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

            const _filterUrls = _.sortBy(_.map(chartData, "label"))
            setFilterUrls((prev) => ["All", ..._filterUrls])
            setReponseSizeStats(chartData)

            if (selectedUrl && selectedUrl !== "All") {
                const filteredChartData = _.filter(chartData, ["label", selectedUrl])
                chartRef.current.data.labels = [selectedUrl]
                chartRef.current.data.datasets = filteredChartData
            } else {
                chartRef.current.data.labels = _filterUrls
                chartRef.current.data.datasets = chartData
            }

            chartRef.current.update("none")
        }
    }, [getChartData, stats])

    useEffect(() => {
        if (selectedUrl) {
            const filteredStats = _.filter(reponseSizeStats, ["label", selectedUrl])
            chartRef.current.data.labels = [selectedUrl]
            chartRef.current.data.datasets = filteredStats
            chartRef.current.update()
        }
        if (selectedUrl === "All") {
            chartRef.current.data.labels = _.map(reponseSizeStats, "label")
            chartRef.current.data.datasets = reponseSizeStats
            chartRef.current.update()
        }
    }, [selectedUrl])

    useEffect(() => {
        if (clearChart) {
            setFilterUrls([])
            setReponseSizeStats([])
            chartRef.current.data.datasets = []
            chartRef.current.update()
        }
    }, [clearChart])

    return (
        <>
            <Grid container direction="row" alignItems="flex-start" spacing={3}>
                <Grid item xs={8}>
                    <Typography variant="subtitle1" align="left">
                        Http Response Size (by URL)
                    </Typography>
                </Grid>
                <Grid item xs={4}>
                    <FormControl variant="outlined" className={classes.select}>
                        <InputLabel id="urlSelect">URL</InputLabel>
                        <Select
                            label="URL"
                            labelId="urlSelect"
                            className={classes.select}
                            value={selectedUrl}
                            onChange={(event) => setSelectedUrl(event.target.value)}
                        >
                            {filterUrls.map((url, index) => {
                                return (
                                    <MenuItem key={index} value={url}>
                                        {url}
                                    </MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default ReponseSizeStatsChart
