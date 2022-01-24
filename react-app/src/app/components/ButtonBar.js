import { Button, CircularProgress, makeStyles } from "@material-ui/core"
import React from "react"

const useStyles = makeStyles({
    root: {
        backgroundColor: "#fff",
        borderBottom: "1px solid rgba(197, 200, 209, .5)",
        marginBottom: "0.5rem",
        padding: "0.5rem 1rem",
    },
    actionButton: {
        marginRight: "0.5rem",
    },
})

const ButtonBar = ({
    isStreamStarted,
    handleOnStart,
    isStartButtonDisabled,
    handleOnStop,
    isStopButtonDisabled,
    handleOnClear,
    isClearButtonDisabled,
}) => {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            {!isStreamStarted ? (
                <>
                    <Button
                        className={classes.actionButton}
                        color="primary"
                        disabled={isStartButtonDisabled}
                        onClick={handleOnStart}
                        variant="contained"
                    >
                        {isStartButtonDisabled ? <CircularProgress size={24} /> : "Start"}
                    </Button>
                    <Button
                        className={classes.actionButton}
                        disabled={isStreamStarted}
                        onClick={handleOnClear}
                        variant="contained"
                    >
                        {isClearButtonDisabled ? <CircularProgress size={24} /> : "Clear"}
                    </Button>
                </>
            ) : (
                <Button
                    className={classes.actionButton}
                    color="primary"
                    disabled={isStopButtonDisabled}
                    onClick={handleOnStop}
                    variant="contained"
                >
                    {isStopButtonDisabled ? <CircularProgress size={24} /> : "Stop"}
                </Button>
            )}
        </div>
    )
}

export default ButtonBar
