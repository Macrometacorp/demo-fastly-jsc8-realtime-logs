import { makeStyles, Typography } from "@material-ui/core"
import { Chart } from "chart.js"
import ChartDataLabels from "chartjs-plugin-datalabels"
import _ from "lodash"
import { useCallback, useEffect, useRef } from "react"
import useInterval from "../../../hooks/useInterval"
import { restQlNames } from "../../../util/constants"
import { executeRestql } from "../../services/restqlService"

const useStyles = makeStyles({
    root: {},
})

const ResponseCodeRatioChart = ({ clearChart }) => {
    const classes = useStyles()

    const chartRef = useRef(null)
    const chartDomRef = useRef(null)

    const updateChart = (labels, data) => {
        chartRef.current.data.labels = labels
        chartRef.current.data.datasets[0] = {
            data,
            backgroundColor: [
                "rgba(64, 81, 181, 1)",
                "rgba(64, 81, 181, 0.6)",
                "rgba(64, 81, 181, 0.4)",
                "rgba(230, 103, 103,1)",
                "rgba(230, 103, 103,0.6)",
            ],
        }
        chartRef.current.update()
    }

    const getStats = useCallback(async () => {
        try {
            let result = await executeRestql(restQlNames.getStatusCodeRatio)
            const sortedResponseCodeRatioData = _.sortBy(result, ["response_status"])
            const responseCodes = _.map(sortedResponseCodeRatioData, "response_status")
            const responseCodeRatios = _.map(sortedResponseCodeRatioData, "count")

            updateChart(responseCodes, responseCodeRatios)
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        if (!chartRef.current && chartDomRef.current) {
            chartRef.current = new Chart(chartDomRef.current, {
                type: "doughnut",
                data: {
                    labels: [],
                    datasets: [],
                },
                plugins: [ChartDataLabels],
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                        },
                        datalabels: {
                            anchor: "center",
                            color: "white",
                            formatter: function (value) {
                                return `${value}%`
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
                Ratio (by status code)
            </Typography>
            <div className={classes.root}>
                <canvas ref={chartDomRef} />
            </div>
        </>
    )
}

export default ResponseCodeRatioChart
