# JSC8 Realtime Log Analytics using GDN

### Live Demo: https://macrometacorp.github.io/demo-jsc8-realtime-logs

This tutorial shows you how to integrate real-time log analytics with Macrometa GDN to monitor the status and activity of Stream workers and Query workers. It provides data about HTTP latency, response count, response size, and unique visitor traffic.

## Setup

| **Federation**                        | **Email**                       | **Passsword** |
| ------------------------------------- | ------------------------------- | ------------- |
| [GDN](https://gdn.paas.macrometa.io/) | demo-realtime-logs@macrometa.io | `xxxxxxxx`    |

## Overview

### Macrometa GDN setup

1. Create and publish the following Stream Workers in your federation:

```
log-generator
http-request-worker
http-request-stats-1m-worker
```

Refer to the following links to add content for each Stream Worker:

-   **[Request Worker](stream-apps/http-request-worker.md)**

-   **[Request Stats 1 Minute](stream-apps/http-request-stats-1m-worker.md)**

-   **[Logs Generator](stream-apps/log-generator.md)**

2. Create the following Query Workers in your federation:

```
GetTopUrl
GetStatusCodeRatio
GetStatsByCollection
GetTopErrorByUrlPath
GetUniqueVisitorsByCountry
```

Refer to this link to add content for each Query Worker:

**[Query Workers](stream-apps/query-worker.md)**

3. Create the following collections in your federation:

```
users (global)
logs (global)
http_url_stats_1m (global)
http_response_code_stats_1m (global)
http_response_latency_stats_1m (global)
http_error_response_code_stats_1m (global)
unique_visitor_by_country_stats_1m (global)
```

Note: If you have run this tutorial before, you might want to truncate the collections.

4. On the development machine, run the following commands in a console:

```bash
1. git clone git@github.com:Macrometacorp/demo-jsc8-realtime-logs.git
2. cd demo-jsc8-realtime-logs/react-app
3. npm install
4. npm run start
```
