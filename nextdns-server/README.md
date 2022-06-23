# NextDNS Report Browser

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

### Initial Design

- [API Documentation](https://nextdns.github.io/api/)
- need to proxy requests from the web front end to the NextDNS API, adding the appropriate API key

