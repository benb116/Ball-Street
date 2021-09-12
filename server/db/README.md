# Data stores

Ball Street uses a PostgreSQL database and Redis cache as data stores

## PostgreSQL

Postgres is used to store all long term data, including user info; NFL data; and entry, offer, and trade information. The TimescaleDB extension should be included so that the PriceHistories table can be easily read (see the getNFLPlayerPriceHistory service)

## Redis

Redis is used to cache certain API responses, store user session information, run message queues, allow for inter-service pub/sub communication, and also to store the latest price and stat information for players