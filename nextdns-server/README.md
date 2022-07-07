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
- [stream logs](https://nextdns.github.io/api/#streaming)

### Problems:
- the device list is not deduplicated; a single device can appear many times with many different IDs
    - this makes it difficult (impossible) to paginate results appropriately directly from the API because if I want to (correctly) show all results for a given device, I need to get all logs entries for multiple device IDs.

### Using a local database:

Consider using a local database.
- use the "stream logs" functionality to get logs as they are generated
  - push them to a messaging queue as they come in
  - queue handler will:
    - deduplicate items based on client IP, device, timestamp
    - trigger a re-fetch of devices if the device is not currently in the database

#### Architecture

1. stream logs handler
  - pushes incoming logs to...
2. messaging queue
3. queue listener
  - if it's an incoming log message, insert into database (ignoring duplicate client IP, device, timestamp)
  - if the device does not exist in the database (based on id, name), insert it

**Database Tables**
(* denotes an index)
`logs` -- the log entries (id*, client, clientIp*, deviceId*, domain*, encrypted, protocol, reasons*, root, status*, timestamp*, tracker)
`devices` -- the device details (id*, name*, model, localIp)






### Initial Design

- [API Documentation](https://nextdns.github.io/api/)
- need to proxy requests from the web front end to the NextDNS API, adding the appropriate API key

#### How the App Works

1. start up
  - load list of profiles from API, update database
  - load list of devices from API, update database
  - load "last stream position" from database for each profile (if exists), start streaming from that position
2. streaming loop
  - on event
    - push event to queue in SSE handler
    - pop event off queue in queue handler
      - insert event into database (ignore dupes) -- id = hash of timestamp, domain, device ID
      - insert device into database (ignore dupes)
3. HTTP API
  - listens for requests from client, responds
    - GET / -- serves app
    - GET /api/logs?<search params>
    - GET /api/profiles
    - GET /api/devices
4. Miscellaneous clean up
  - CRON jobs?
    - delete logs older than <something>

#### TODO

✅ 1. set up database + migrations
  ✅ - using Knex for database connection & [migrations](http://knexjs.org/guide/migrations.html)
✅ 2. write basic database routines: insert event, insert device, insert profiles, get profiles, get devices
✅ 3. write startup actions:
  ✅ - get profiles & update database
  ✅ - get "last stream position" (`lastEventId`) from database **for each profile** & start streaming from there
✅ 4. write handler for incoming queue messages
✅ 5. write SSE handler to push messages to queue
6. tests for items 3, 4, 5
  ✅ - src/app.controller.ts
  ✅ - src/services/database.service.ts
  ✅ - src/services/next-dns-api.service.ts
  - src/services/queue.service.ts
  - src/services/start-up.service.ts
7. write HTTP /api routes
8. write front end
9. write CRON jobs
10. write build process
