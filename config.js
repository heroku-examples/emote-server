const PORT = process.env.PORT || 8080;
const REDIS_URL = process.env.REDIS_URL;
const RATE_LIMIT_ENABLED = process.env.RATE_LIMIT_ENABLED === 'true';
const RATE_LIMIT_MAX = +process.env.RATE_LIMIT_MAX || 400;
const RATE_LIMIT_WINDOW = process.env.RATE_LIMIT_WINDOW || '1 minute';
const HEARTBEAT_TIMEOUT = process.env.HEARTBEAT_TIMEOUT || 5;
const EVENT_ID_LENGTH = +process.env.EVENT_ID_LENGTH || 32;
const EVENTS_MAX = +process.env.EVENTS_MAX || 32;
const KAFKA_CLIENT_CERT = process.env.KAFKA_CLIENT_CERT;
const KAFKA_CLIENT_CERT_KEY = process.env.KAFKA_CLIENT_CERT_KEY;
const KAFKA_TRUSTED_CERT = process.env.KAFKA_TRUSTED_CERT;
const KAFKA_PREFIX = process.env.KAFKA_PREFIX;
const KAFKA_URL = process.env.KAFKA_URL;

const KAFKA_BROKERS = KAFKA_URL.replaceAll('kafka+ssl://', '').split(',');

const EMOTE_ALLOWLIST = [
  'celebrate',
  'heart',
  'smile',
  'clap',
  'plusone',
  'question',
  'dolphin',
];

export {
  PORT,
  REDIS_URL,
  RATE_LIMIT_ENABLED,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
  HEARTBEAT_TIMEOUT,
  EMOTE_ALLOWLIST,
  EVENT_ID_LENGTH,
  EVENTS_MAX,
  KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY,
  KAFKA_TRUSTED_CERT,
  KAFKA_PREFIX,
  KAFKA_BROKERS,
};
