**getStatsByCollection:**

```
FOR stats in @@collection
    FILTER stats.request_10sec_timeframe > DATE_TIMESTAMP(DATE_SUBTRACT(DATE_NOW(), 1, "hours"))
    SORT stats.request_10sec_timeframe ASC
    RETURN stats
```

**fastlyGetTopUrl:**

```
LET stats = (
    FOR stat in fastly_http_url_stats_1m
        FILTER
            stat.request_10sec_timeframe > DATE_TIMESTAMP(DATE_SUBTRACT(DATE_NOW(), "P1D"))
        COLLECT
            url = stat.url INTO count = stat.count
        RETURN {
            "url": url,
            "count": SUM(count)
        }
)

FOR stat in stats
    SORT stat.count DESC
    LIMIT @topN
    RETURN stat
```

**fastlyGetTopErrorByUrlPath:**

```
LET stats = (
    FOR stat in fastly_http_error_response_code_stats_1m
        FILTER
            stat.request_10sec_timeframe > DATE_TIMESTAMP(DATE_SUBTRACT(DATE_NOW(), "P1D"))
        COLLECT
            url = stat.url INTO count = stat.count
        RETURN {
            "url": url,
            "count": SUM(count)
        }
)

FOR stat in stats
    SORT stat.count DESC
    LIMIT @topN
    RETURN stat
```

**fastlyGetUniqueVisitorsByCountry:**

```
FOR stat IN fasty_unique_visitor_by_country_stats_1m
    FILTER
        stat.request_10sec_timeframe > DATE_TIMESTAMP(DATE_SUBTRACT(DATE_NOW(), "P1D"))
    COLLECT
        country = stat.country INTO client_ip = stat.client_ip
    RETURN {
        "country": country,
        "visitor_count": COUNT_DISTINCT(FLATTEN(client_ip))
    }
```

**fastlyGetStatusCodeRatio:**

```
LET stats_last_7_days = (
    FOR stat in fastly_http_response_code_stats_1m
        FILTER
            stat.request_10sec_timeframe > DATE_TIMESTAMP(DATE_SUBTRACT(DATE_NOW(), "P1D"))
        RETURN stat
)

LET total_records = SUM(
    FOR stat IN stats_last_7_days
    RETURN stat.count
)

FOR stat IN stats_last_7_days
    COLLECT
        response_status = stat.response_status INTO count = stat.count
    RETURN {
        "response_status": response_status,
        "count": ROUND(SUM(count)/total_records * 100)
    }
```
