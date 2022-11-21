NextDNS Log Viewer
==================

This is a simple little app to capture logs from the NextDNS service API and
present them in a searchable format for review.

## Rationale for this App

I signed up for the [NextDNS](https://nextdns.io/) service to allow ad blocking
and parental controls on our local area network. I set up a local DNS server
with the NextDNS proxy. I wanted a way to monitor the usage of our network, but
NextDNS's online logging left a lot to be desired -- it basically just provided
a list of requests which was very difficult to filter. Specifically, you
couldn't filter by device. Once NextDNS released their public API, I started
this project to remedy that.

*Note: after this project was started, NextDNS released some updates to their
web interface that make it possible to filter by device.*

## Technology

**Backend**: [NestJS](https://nestjs.com/) server which captures streamed log
entries from NextDNS, stores them in a local database, and serves them to a
simple web front end. Streaming log entries are handled in an event-driven
architecture; first pushed to a [RabbitMQ](https://www.rabbitmq.com/) queue
then handled when resources are available and inserted into a
[MariaDB](https://mariadb.org/) database (although in production I am
considering using an Amazon RDB instance).

**Frontend**: A [Vite](https://vitejs.dev/) application which provides
rudimentary filtering and searching of log entries.
