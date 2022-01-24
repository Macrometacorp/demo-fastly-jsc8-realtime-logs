import { createTheme, ThemeProvider } from "@material-ui/core"
import Dashboard from "./app/components/Dashboard"
import { Chart, registerables } from "chart.js"
import "chartjs-adapter-luxon"
import ChartStreaming from "chartjs-plugin-streaming"

const theme = createTheme({
    typography: {
        fontFamily: "Lato",
    },
    overrides: {
        MuiTableCell: {
            root: {
                padding: "0.8rem",
            },
            stickyHeader: {
                backgroundColor: "#d0e0f3",
            },
            head: {
                color: "#ffffff",
                fontWeight: 900,
            },
        },
        MuiTypography: {
            root: {
                fontWeight: "500 !important",
            },
        },
        MuiButton: {
            root: {
                borderColor: "transparent",
                minWidth: "auto",
            },
            contained: {
                backgroundColor: "#E1E1FA",
                boxShadow: "none",
                color: "#4D4DAD",
                "&:hover, &:focus, &:active": {
                    backgroundColor: "#C2C2F5",
                    boxShadow: "0 2px 5px rgba(133, 133, 235, .35)",
                    color: "#343473",
                },
                "&:disabled": {
                    backgroundColor: "#E2E4E8",
                    color: "#535968",
                },
            },
            containedPrimary: {
                backgroundColor: "#6767E6",
                color: "#FFF",
                "&:hover, &:focus, &:active": {
                    backgroundColor: "#4D4DAD",
                    color: "#FFF",
                },
            },
            label: {
                fontWeight: 700,
            },
        },
        MuiInputLabel: {
            outlined: {
                transform: "translate(14px, 0.7rem) scale(1)",
            },
        },
        MuiOutlinedInput: {
            input: {
                padding: "0.65rem 14px",
            },
        },
        MuiPaginationItem: {
            root: {
                borderRadius: "0px",
            },
            page: {
                padding: "25px",
                "&$selected": {
                    backgroundColor: "#4b81c3",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#4b81c3",
                        color: "#ffffff",
                    },
                },
                "&:hover": {
                    backgroundColor: "#4b81c3",
                    color: "#ffffff",
                },
            },
        },
        MuiToggleButton: {
            root: {
                "&$selected": {
                    backgroundColor: "#4b81c3",
                    color: "#ffffff",
                    "&:hover": {
                        backgroundColor: "#4b81c3",
                        color: "#ffffff",
                    },
                },
                "&:hover": {
                    backgroundColor: "#4b81c3",
                    color: "#ffffff",
                },
            },
        },
        MuiTableHead: {
            root: {
                backgroundColor: "#4b81c3",
            },
        },
        MuiTableContainer: {
            root: {
                overflowX: "inherit",
            },
        },
    },
})

Chart.register(...registerables)
Chart.register(ChartStreaming)
const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <Dashboard />
        </ThemeProvider>
    )
}
export default App
