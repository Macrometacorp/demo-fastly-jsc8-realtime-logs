import React from "react"
import { Button, Grid, makeStyles, Typography } from "@material-ui/core"

import MacrometaLogo from "../images/logo-macrometa.png"

const useStyles = makeStyles({
    container: {
        backgroundColor: "#fff",
        borderBottom: "1px solid rgba(197, 200, 209, .5)",
        padding: "0.5rem 1rem",
    },
    logo: {
        height: "32px",
        margin: "0 1rem 0 0",
        padding: "0 0 0.25rem",
        width: "128px",
    },
    heading: {
        color: "#4D4DAD",
        fontSize: "1rem",
        fontWeight: "700 !important",
        lineHeight: "32px",
        margin: "0 0.5rem 0 0",
        whiteSpace: "nowrap",
    },
    subheading: {
        color: "#535968",
        fontSize: "1rem",
        fontWeight: "400 !important",
        lineHeight: "32px",
        margin: "0",
        whiteSpace: "nowrap",
    },
    aboutButton: {
        textTransform: "none",
        whiteSpace: "nowrap",
    },
})

const Header = () => {
    const classes = useStyles()

    return (
        <Grid
            alignItems="center"
            className={classes.container}
            container={true}
            direction="row"
            justifyContent="space-between"
            wrap="nowrap"
        >
            <Grid container justifyContent="flex-start" alignItems="center" wrap="nowrap">
                <img alt="Macrometa" className={classes.logo} src={MacrometaLogo} />
                <Typography variant="h1" className={classes.heading}>
                    Realtime Log Analytics
                </Typography>
                <Typography className={classes.subheading}>
                    Featuring Stream Workers and Query Workers for log data
                </Typography>
            </Grid>
            <Grid container justifyContent="flex-end" alignItems="center" wrap="nowrap">
                <Button
                    className={classes.aboutButton}
                    onClick={() => {
                        window.open("https://github.com/Macrometacorp/demo-jsc8-realtime-logs", "_blank")
                    }}
                    variant="contained"
                >
                    Source on GitHub
                </Button>
            </Grid>
        </Grid>
    )
}

export default Header
