```
@App:name("fastly-log-generator")
@App:description("fastly-log-generator")

/*
• This Stream worker uses trigger to make 3 http requests to fastly service every 3 seconds. It picks 3  URL from predefined URLs.
*/

define trigger FastlyLogGeneratorTrigger at every 3 sec;


-- http sink used for making HTTP request with GET method
@sink(type='http', publisher.url='{{url}}', method='GET', @map(type='json'))
define stream FastlyGetLogGenerator (url string);

-- http sink used for making HTTP request with PUT method
@sink(type='http', publisher.url='{{url}}', method='POST', @map(type='json'))
define stream FastlyPostLogGenerator (url string);

-- http sink used for making HTTP request with POST method
@sink(type='http', publisher.url='{{url}}', method='PUT', @map(type='json'))
define stream FastlyPutLogGenerator (url string);

@sink(type='http', publisher.url='{{url}}', method='GET', @map(type='json'))
define stream FastlyInitCollectionGenerator (url string);

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/init" as url
from FastlyLogGeneratorTrigger[count()==1]
insert into FastlyInitCollectionGenerator;

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/collections/key" as url
from FastlyLogGeneratorTrigger
insert into FastlyGetLogGenerator;

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/collections/key?error=true" as url
from FastlyLogGeneratorTrigger
insert into FastlyGetLogGenerator;

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/collections/query?query=fastlyGetQuery&name=No" as url
from FastlyLogGeneratorTrigger
insert into FastlyPostLogGenerator;

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/collections/query?query=fastlyGetQuery" as url
from FastlyLogGeneratorTrigger
insert into FastlyPostLogGenerator;

select "https://FASTLY_COMPUTE_EDGE_SERVICE_URL/documents" as url
from FastlyLogGeneratorTrigger
insert into FastlyPutLogGenerator;

```
