export const streamAppNames = [
    "fastly-http-request-stats-1m-worker",
    "fastly-http-request-worker",
    "fastly-log-generator",
]
export const collections = [
    "fastly_logs",
    "fastly_http_url_stats_1m",
    "fastly_http_response_code_stats_1m",
    "fastly_http_response_latency_stats_1m",
    "fasty_unique_visitor_by_country_stats_1m",
    "fastly_http_error_response_code_stats_1m",
]
export const streamNames = {
    responseCodeStatsStream: "fastly_http_response_code_stats_1m",
    responseLatencyStatsStream: "fastly_http_response_latency_stats_1m",
    responseSizeStatsStream: "fastly_http_url_stats_1m",
}
export const restQlNames = {
    getStatsByCollection: "fastlyGetStatsByCollection",
    getTopErrorByUrlPath: "fastlyGetTopErrorByUrlPath",
    getTopUrl: "fastlyGetTopUrl",
    getStatusCodeRatio: "fastlyGetStatusCodeRatio",
    getUniqueVisitorsByCountry: "fastlyGetUniqueVisitorsByCountry",
}
