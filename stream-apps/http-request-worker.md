```
@App:name("fastly-http-request-worker")
@App:description("fastly-http-request-worker")

/*
• This Stream worker reads fastly logs from `logs` collection and performs reordering for out of order logs. Also, based on log timestamp it determines the 10 second window and adds that window timestamp as an additional field.
*/

define function getTime[javascript] return string {
    const date = new Date(data[0]);
    const isRequestMinute = JSON.parse(data[1]);

    if (isRequestMinute) {
        const logTimestampSecond = date.getSeconds();

        if (logTimestampSecond >= 0 && logTimestampSecond <= 9) {
            return date.setSeconds("00").toString();
        }
        if (logTimestampSecond >= 10 && logTimestampSecond <= 19) {
            return date.setSeconds("10").toString();
        }
        if (logTimestampSecond >= 20 && logTimestampSecond <= 29) {
            return date.setSeconds("20").toString();
        }
        if (logTimestampSecond >= 30 && logTimestampSecond <= 39) {
            return date.setSeconds("30").toString();
        }
        if (logTimestampSecond >= 40 && logTimestampSecond <= 49) {
            return date.setSeconds("40").toString();
        }
        if (logTimestampSecond >= 50 && logTimestampSecond <= 59) {
            return date.setSeconds("50").toString();
        }
    } else {
        return date.getTime().toString();
    }
};

@source(type='c8db', collection='fastly_logs', @map(type='json'))
define stream LogRecords(timestamp string, request_method string, response_status int, url string, response_body_size long, time_elapsed long, geo_country string, client_ip string);

@sink(type="c8streams", stream="fastly-intermediate-stream", replication.type="global", @map(type='json'))
define stream IntermediateStream(request_10sec_timeframe long, request_timeStamp long, request_method string, response_status int, url string, response_body_size long, latency long, country string, client_ip string);

select
    convert(getTime(timestamp, true), "long") as request_10sec_timeframe,
    convert(getTime(timestamp, false), "long") as request_timeStamp,
    request_method,
    response_status,
    str:split(url, "\?", 0) as url,
    response_body_size,
    time_elapsed as latency,
    geo_country as country,
    client_ip
from LogRecords
insert into LogRecordsReorderingStream;

select *
from LogRecordsReorderingStream#reorder:kslack(request_timeStamp, 10000l)
insert into IntermediateStream;

```
