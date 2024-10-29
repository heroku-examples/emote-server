import { EventIterator } from 'event-iterator';
import { producer, events, topic } from '../lib/kafka.js';
import { getVotes, saveEvent, vote } from '../lib/db.js';
import {
  HEARTBEAT_TIMEOUT,
  EVENT_ID_LENGTH,
  EMOTE_ALLOWLIST,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW,
} from '../config.js';

export default async function (fastify, _opts) {
  /**
   * Validation Schemas
   */
  const paramsSchema = {
    $id: 'params',
    type: 'object',
    properties: {
      id: {
        type: 'string',
        maxLength: EVENT_ID_LENGTH,
      },
    },
  };

  const bodySchema = {
    $id: 'body',
    type: 'object',
    required: ['emote'],
    properties: {
      emote: {
        type: 'string',
        enum: EMOTE_ALLOWLIST,
      },
    },
  };

  fastify.addSchema(paramsSchema);
  fastify.addSchema(bodySchema);

  /**
   * Cleanup events to prevent memory leaks
   *
   * @param {TimerHandler} hb
   * @param {Function} listener
   */
  function cleanup(id, hb, fn) {
    fastify.log.info(`Cleaning up event listeners for id: ${id}`);
    clearInterval(hb);
    events.removeListener(`emote:${id}`, fn);
    events.removeListener(`heartbeat:${id}`, fn);
    events.removeListener(`votes:${id}`, fn);
  }

  /**
   * Start a heatbeat function and report votes by event
   *
   * @param {String} id - Event ID
   */
  function heartbeat(id) {
    fastify.log.info(`Starting heartbeat for event id: ${id}`);
    return setInterval(async () => {
      const votes = await getVotes(id);
      events.emit(`heartbeat:${id}`, {
        id,
        event: 'heartbeat',
        data: 'ping',
      });
      events.emit(`votes:${id}`, {
        id,
        event: 'votes',
        data: JSON.stringify(votes),
      });
    }, HEARTBEAT_TIMEOUT * 1000);
  }

  fastify.get(
    '/events/:id',
    {
      schema: paramsSchema,
    },
    async (request, reply) => {
      // fastify-cors doesn't seem to work with fastify-sse-v2
      // so we need to add this header to this route manually
      reply.raw.setHeader('Access-Control-Allow-Origin', '*');
      const id = request.params.id;
      const hb = heartbeat(id);

      const eventIterator = new EventIterator(({ push }) => {
        events.on(`emote:${id}`, push);
        events.on(`heartbeat:${id}`, push);
        events.on(`votes:${id}`, push);
        request.raw.on('close', () => cleanup(id, hb, push));
        return () => cleanup(id, hb, push);
      });

      reply.sse(eventIterator);
    }
  );

  /**
   * Get the current votes by Event ID
   */
  fastify.get(
    '/emote/:id',
    {
      schema: {
        params: paramsSchema,
      },
    },
    async (request, reply) => {
      const id = request.params.id;
      let votes = {};
      try {
        votes = await getVotes(id);
      } catch (err) {
        fastify.log.error(err);
      }
      reply.send(votes);
    }
  );

  /**
   * Send a emote by Event ID
   */
  fastify.post(
    '/emote/:id',
    {
      config: {
        rateLimit: {
          max: RATE_LIMIT_MAX,
          timeWindow: RATE_LIMIT_WINDOW,
        },
      },
      schema: {
        body: bodySchema,
        params: paramsSchema,
      },
    },
    async (request, reply) => {
      const id = request.params.id;
      const emote = request.body.emote;

      try {
        await saveEvent(id);
        await vote(id, emote);
      } catch (err) {
        fastify.log.error(err);
        reply.statusCode = 400;
        reply.send({ error: `Can't submit vote: ${err.message}` });
        return;
      }

      const message = {
        event: `emote:${id}`,
        data: {
          id,
          event: 'emote',
          data: emote,
        },
      };
      producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
      reply.send({ message: 'emote received' });
    }
  );
}
