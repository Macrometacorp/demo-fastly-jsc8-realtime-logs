import { makeStyles, Typography } from "@material-ui/core"
import { useCallback, useEffect, useState } from "react"
import ReactWordcloud from "react-wordcloud"
import useInterval from "../../../hooks/useInterval"
import { restQlNames } from "../../../util/constants"
import { executeRestql } from "../../services/restqlService"

import "tippy.js/dist/tippy.css"
import "tippy.js/animations/scale.css"

const useStyles = makeStyles({
    root: {},
})

const UniqueVisitorsChart = ({ clearChart }) => {
    const classes = useStyles()
    const [uniqueVisitorsStats, setUniqueVisitorsStats] = useState([])

    const wordChartOptions = {
        enableTooltip: true,
        deterministic: true,
        fontFamily: "impact",
        fontSizes: [18, 28],
        fontStyle: "normal",
        fontWeight: "normal",
        padding: 1,
        rotations: 3,
        rotationAngles: [0, 0],
        scale: "sqrt",
        spiral: "archimedean",
    }

    const getUniqueVisitorStats = useCallback(async () => {
        try {
            const result = await executeRestql(restQlNames.getUniqueVisitorsByCountry)
            let stats = []
            if (result && result.length) {
                stats = result.reduce((_stats, stat) => {
                    _stats.push({ text: stat.country, value: stat.visitor_count })
                    return _stats
                }, [])
            }
            setUniqueVisitorsStats(stats)
        } catch (error) {
            console.error(error)
        }
    }, [])

    useEffect(() => {
        if (clearChart) {
            setUniqueVisitorsStats([])
        }
    }, [clearChart])

    useEffect(() => {
        getUniqueVisitorStats()
    }, [getUniqueVisitorStats])

    useInterval(getUniqueVisitorStats, 10000)

    return (
        <>
            <Typography variant="subtitle1" align="left">
                Unique Visitors
            </Typography>
            <div className={classes.root}>
                <ReactWordcloud words={uniqueVisitorsStats} options={wordChartOptions} />
            </div>
        </>
    )
}

export default UniqueVisitorsChart
