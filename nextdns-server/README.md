# NextDNS Report Browser

[Project Notes](https://www.notion.so/NestDNS-API-Report-Generator-854d70e85056438795423cb3ac49cc50)

## Description

A [Nest](https://github.com/nestjs/nest) application which acts as the back end for the NextDNS Report Browser application.

## Version History/Roadmap

0.0.0 Initial Commit
0.0.1 Proxy Controller

## Features

### MVP

- (front end) select/filter by clients
  - (backend) need to cache client list?
- (front end) show blocked/unblocked requests only
- (front end) show only from a date/time range
- (front end) infinite scroll

### Would Be Nice...

- (back end) monitor logs for problematic activity & notify via Slack

## Notes

### NextDNS API

- [get device list](http://localhost:3000/nextdns/profiles/92921c/analytics/devices)
- [get logs](http://localhost:3000/nextdns/profiles/92921c/logs?from=2022-06-23T21:08:05.741Z&to=2022-06-23T21:18:24.557Z&limit=50&raw=1)
- [get profiles](http://localhost:3000/nextdns/profiles)


### Initial Design

- [API Documentation](https://nextdns.github.io/api/)
- need to proxy requests from the web front end to the NextDNS API, adding the appropriate API key

