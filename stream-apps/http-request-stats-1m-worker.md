```
@App:name("fastly-http-request-stats-1m-worker")
@App:description("fastly-http-request-stats-1m-worker")

/*
• This Stream worker reads logs from `fastly-intermediate-stream` and performs aggregation on them for 10 seconds window. It performs aggregation for response_status, url, response_body_size, latency.
*/

@source(type="c8streams", stream.list="fastly-intermediate-stream", replication.type="global", @map(type='json'))
define stream IntermediateStream(request_10sec_timeframe long, request_timeStamp long, request_method string, response_status int, url string, response_body_size long, latency long, country string, client_ip string);

@store(type="c8db", collection="fastly_http_response_code_stats_1m", @map(type='json'))
define table HttpResponseCodeStats1min(request_10sec_timeframe long, response_status int, count long);

@sink(type="c8streams", stream="fastly_http_response_code_stats_1m", replication.type="global", @map(type='json'))
define stream HttpResponseCodeStats1minStream(request_10sec_timeframe long, response_status int, count long);

@store(type="c8db", collection="fastly_http_url_stats_1m", @map(type='json'))
define table HttpResponseSizeStats1min(request_10sec_timeframe long, url string, response_body_size double, count long);

@sink(type="c8streams", stream="fastly_http_url_stats_1m", replication.type="global", @map(type='json'))
define stream HttpResponseSizeStats1minStream(request_10sec_timeframe long, url string, response_body_size double, count long);

@store(type="c8db", collection="fastly_http_response_latency_stats_1m", @map(type='json'))
define table HttpResponseLatencyStats1min(request_10sec_timeframe long, response_status int, latency double);

@sink(type="c8streams", stream="fastly_http_response_latency_stats_1m", replication.type="global", @map(type='json'))
define stream HttpResponseLatencyStats1minStream(request_10sec_timeframe long, response_status int, latency double);

@store(type="c8db", collection="fastly_http_error_response_code_stats_1m", @map(type='json'))
define table ErrorResponseCodeByUrl(request_10sec_timeframe long, url string, count long);

@store(type="c8db", collection="fasty_unique_visitor_by_country_stats_1m", @map(type='json'))
define table UniqueVisitorByCountry(request_10sec_timeframe long, country string, client_ip object);

-- Counts the total number of requests for a response_status for every 10 sec
SELECT
    request_10sec_timeframe,
    response_status,
    count() as count
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY response_status
INSERT INTO HttpResponseCodeStats1minStream;

-- Calculates the average latency for a response_status for every 10 sec
SELECT
    request_10sec_timeframe,
    response_status,
    avg(latency) as latency
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY response_status
INSERT INTO HttpResponseLatencyStats1minStream;

-- Calculates the average response_body_size for a url for every 10 sec
SELECT
    request_10sec_timeframe,
    url,
    avg(response_body_size) as response_body_size,
    count() as count
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY url
INSERT INTO HttpResponseSizeStats1minStream;


--Persist into db, the calculated the total number of requests for a response_status for every 10 sec
SELECT
    request_10sec_timeframe,
    response_status,
    count() as count
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY response_status
INSERT INTO HttpResponseCodeStats1min;

--Persist into db, the calculated average latency for a response_status for every 10 sec
SELECT
    request_10sec_timeframe,
    response_status,
    avg(latency) as latency
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY response_status
INSERT INTO HttpResponseLatencyStats1min;

--Persist into db, the calculated average response_body_size for a url for every 10 sec
SELECT
    request_10sec_timeframe,
    url,
    avg(response_body_size) as response_body_size,
    count() as count
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY url
INSERT INTO HttpResponseSizeStats1min;

--Persist into db, the calculated total number of requests with error response_status for every 10 sec
SELECT
    request_10sec_timeframe,
    url,
    count() as count
FROM IntermediateStream[response_status >= 400 and response_status <= 599]#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY url
INSERT INTO ErrorResponseCodeByUrl;

--Persist into db, the unique visitors' client_ip grouped by country for every 10 sec.
SELECT
    request_10sec_timeframe,
    country,
    list:collect(client_ip, true) as client_ip
FROM IntermediateStream#window.externalTimeBatch(request_timeStamp, 10 sec, request_10sec_timeframe)
GROUP BY country
INSERT INTO UniqueVisitorByCountry;

```
