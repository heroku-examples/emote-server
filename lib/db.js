import Redis from "ioredis";
import { REDIS_URL, EVENTS_MAX } from "../config.js";

const db = new Redis(REDIS_URL, {
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Save an Event in Redis
 *
 * @param {String} id - Event ID
 * @returns {Promise<any>}
 */
export async function saveEvent(id) {
  const total = await db.scard("events");

  if (total >= EVENTS_MAX) {
    return Promise.reject(new Error("Max Events Reached"));
  }

  return db.sadd("events", id);
}

/**
 * Get Votes by Event ID
 *
 * @param {String} id - Event ID
 * @returns {Promise<any>} Object with emotes and votes
 */
export function getVotes(id) {
  return db.hgetall(id);
}

/**
 * Vote on an emote by Event ID
 *
 * @param {String} id - EventID
 * @param {String} emote - Emote code
 * @returns {Promise<any>}
 */
export function vote(id, emote) {
  return db.hincrby(id, emote, 1);
}

export { db };
