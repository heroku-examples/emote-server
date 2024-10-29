import 'dotenv/config';

import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import Fastify from 'fastify';
import FastifyCors from '@fastify/cors';
import FastifyStatic from '@fastify/static';
import FastifyAutoload from '@fastify/autoload';
import FastifyRateLimit from '@fastify/rate-limit';
import FastifySSEPlugin from 'fastify-sse-v2';
import { db } from './lib/db.js';
import { createLogger } from './lib/logger.js';
import { PORT } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: createLogger, pluginTimeout: 0 });

fastify.register(FastifyRateLimit, {
  global: false,
  redis: db,
});
fastify.register(FastifyStatic, {
  root: join(__dirname, 'public'),
});
fastify.register(FastifySSEPlugin);
fastify.register(FastifyCors);

fastify.register(FastifyAutoload, {
  dir: join(__dirname, 'routes'),
  options: { prefix: '/api' },
});

/**
 * Start Server
 */
async function start() {
  const address = await fastify.listen({ port: PORT, host: '0.0.0.0' });

  fastify.log.info(`Server listening on ${address}`);
}

start().catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});
