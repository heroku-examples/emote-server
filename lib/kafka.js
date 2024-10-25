import { EventEmitter } from "node:events";
import { Kafka } from "kafkajs";
import { createLogger } from "./logger.js";
import {
  KAFKA_BROKERS,
  KAFKA_CLIENT_CERT,
  KAFKA_CLIENT_CERT_KEY,
  KAFKA_PREFIX,
  KAFKA_TRUSTED_CERT,
} from "../config.js";

const logger = createLogger("kafka");

const kafka = new Kafka({
  clientId: "emotes-api",
  brokers: KAFKA_BROKERS,
  ssl: {
    rejectUnauthorized: false,
    cert: KAFKA_CLIENT_CERT,
    key: KAFKA_CLIENT_CERT_KEY,
    ca: KAFKA_TRUSTED_CERT,
  },
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: KAFKA_PREFIX + "emotes" });
const topic = KAFKA_PREFIX + "emotes";

const events = new EventEmitter();
await consumer.subscribe({ topic });
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    logger.info(
      { topic, partition, message: message.value.toString() },
      "received message"
    );
    try {
      if (topic !== KAFKA_PREFIX + "emotes") {
        logger.error({ topic }, "Invalid topic");
        return;
      }
      const { event, data } = JSON.parse(message.value.toString());
      events.emit(event, data);
    } catch (error) {
      logger.error({ error }, "Error parsing message");
    }
  },
});
await producer.connect();

process.on("SIGINT", async () => {
  logger.info("Cleaning up kafka connection");
  await producer.disconnect();
  await consumer.disconnect();
  process.exit(0);
});

export { producer, consumer, topic, events };
