import { Grid, makeStyles, TextField, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import _ from "lodash"
import { useCallback, useEffect, useRef, useState } from "react"
import useInterval from "../../../hooks/useInterval"
import { restQlNames } from "../../../util/constants"
import { executeRestql } from "../../services/restqlService"

const useStyles = makeStyles({
    root: {
        height: "18rem",
    },
})

const TopUrlsChart = ({ clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)

    const [topUrlsData, setTopUrlsData] = useState([])
    const [topN, setTopN] = useState(7)

    const updateChart = (labels, data) => {
        chartRef.current.data.labels = labels
        chartRef.current.data.datasets[0] = {
            data,
            backgroundColor: ["rgba(93, 108, 192, 0.7)"],
        }
        chartRef.current.update()
    }

    const handleChange = (event) => {
        const _topN = Math.abs(event.target.value) || 1
        setTopN(_topN)
        const filteredTopUrls = topUrlsData.slice(0, _topN)
        const url = _.map(filteredTopUrls, "url")
        const count = _.map(filteredTopUrls, "count")

        updateChart(url, count)
    }

    const getStats = useCallback(async () => {
        try {
            const result = await executeRestql(restQlNames.getTopUrl, { topN })
            const sortedResponseCodeRatioData = _.orderBy(result, ["count"], ["desc"])
            setTopUrlsData(sortedResponseCodeRatioData)
            const url = _.map(sortedResponseCodeRatioData, "url")
            const count = _.map(sortedResponseCodeRatioData, "count")

            updateChart(url, count)
        } catch (error) {
            console.error(error)
        }
    }, [topN])

    useEffect(() => {
        if (!chartRef.current && chartDomRef.current) {
            chartRef.current = new Chart(chartDomRef.current, {
                type: "bar",
                data: {
                    labels: [],
                    datasets: [],
                },
                options: {
                    indexAxis: "y",
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: false,
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false,
                            },
                            ticks: {
                                autoSkip: false,
                            },
                        },
                        y: {
                            grid: {
                                display: false,
                            },
                            ticks: {
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
            setTopN(7)
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
            <Grid container direction="row" alignItems="flex-start" spacing={3}>
                <Grid item xs={9}>
                    <Typography variant="subtitle1" align="left">
                        Top URLs
                    </Typography>
                </Grid>
                <Grid item xs={3}>
                    <TextField
                        label="TopN"
                        type="number"
                        variant="outlined"
                        size="small"
                        onChange={handleChange}
                        value={topN}
                        InputProps={{
                            inputProps: { min: 1, max: 50, pattern: "^[1-9]d*$" },
                        }}
                        style={{ width: "100%" }}
                    />
                </Grid>
            </Grid>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default TopUrlsChart
