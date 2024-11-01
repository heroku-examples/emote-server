# emote-server

Backend for the [Emote Widget](https://github.com/heroku-examples/emote-widget)

## Installation & Deployment

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/heroku-examples/emote-server/tree/main)

### Manual Deployment

1. Create an Heroku application:

```bash
heroku create <app-name>
```

2. Add Heroku Key-Value Support:

```bash
heroku addons:create heroku-redis:mini
```

3. Add Apache Kafka on Heroku Support:

```bash
heroku addons:create heroku-kafka:basic-0
```

4. Create an Apache Kafka Topic

```bash
heroku kafka:topics:create emotes
```

5. Deploy to Heroku

```
git push heroku main
```

## Local Development

Enable `pnpm` with `corepack`:

```bash
corepack use pnpm
```

Install dependencies:

```bash
pnpm install
```

Run Server in development mode:

```bash
pnpm run start:dev
```

## Configuration

- `REDIS_URL` - A Redis connection string
- `KAFKA_CLIENT_CERT` - Kafka client certificate
- `KAFKA_CLIENT_CERT_KEY` - Kafka client private key
- `KAFKA_PREFIX` - Kafka prefix (For multitenant plans on Heroku)
- `KAFKA_TRUSTED_CERT` - Kafka trusted certificate
- `KAFKA_URL` - Kafka brokers urls
- `RATE_LIMIT_ENABLE` - Enable rate limitting (Default: true)
- `RATE_LIMIT_MAX` - Max number of requests per time window (Default: 400)
- `RATE_LIMIT_WINDOW` - Duration of the Rate Limit time window (Default: 1 minute)
- `HEARTBEAT_TIMEOUT` - Duration of the Heartbeat (Default: 30 seconds)
- `EVENT_ID_LENGTH` - Max length of an Event ID (Default: 32 characters)
- `EVENTS_MAX` - Max number of Event Streams (Default: 32)

## API

### `GET /api/emote/:id`

Returns the votes by Event

#### Url Parameters

- `id` - Represents an Event by ID

#### Output

```json
{
  "smile": 100,
  "love": 103,
  "plus_one": 5,
  "question": 1
}
```

### `POST /api/emote/:id`

Submit a vote by Event

#### Url Parameters

- `id` - Represents an Event by ID

#### Body

```json
{
  "emote": "smile"
}
```

#### Output (200 - Success)

**Body**

```json
{
  "message": "emote received"
}
```

#### Output (429 - Rate Limit)

**Headers**

```
retry-after: 60000
x-ratelimit-limit: 100
x-ratelimit-remaining: 0
x-ratelimit-reset: 39
```

**Body**

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded, retry in 1 minute",
  "statusCode": 429
}
```

### `GET /api/events/:id`

Connect to an event stream by Event ID

#### Events

- `emote` - An `emote` has been received - (data: `smile`)
- `votes` - A `votes` state object has been received (data: `{"smile": 1, "question": 3}`)
