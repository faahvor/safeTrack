import 'dotenv/config';
import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { Server as SocketServer } from 'socket.io';

import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { usersRoutes } from './modules/users/users.routes.js';
import { contactsRoutes } from './modules/contacts/contacts.routes.js';
import { journeysRoutes } from './modules/journeys/journeys.routes.js';
import { trackingRoutes } from './modules/tracking/tracking.routes.js';
import { sosRoutes } from './modules/sos/sos.routes.js';
import { notificationsRoutes } from './modules/notifications/notifications.routes.js';
import { checkInsRoutes } from './modules/checkins/checkins.routes.js';
import { registerSocketHandlers } from './sockets/index.js';

declare module 'fastify' {
  interface FastifyInstance {
    io?: SocketServer;
  }
}

async function start() {
  await connectDB();

  const fastify = Fastify({ logger: { level: 'info' } });

  // ─── Plugins ─────────────────────────────────────────────────────────────
  await fastify.register(fastifyCors, {
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  });

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: env.JWT_SECRET,
  });

  await fastify.register(fastifyRateLimit, {
    max: 200,
    timeWindow: '1 minute',
  });

  await fastify.register(fastifySwagger, {
    openapi: {
      info: { title: 'SafeTrack API', version: '1.0.0' },
      components: {
        securitySchemes: {
          bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        },
      },
    },
  });

  await fastify.register(fastifySwaggerUi, { routePrefix: '/docs' });

  // ─── Routes ──────────────────────────────────────────────────────────────
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(usersRoutes, { prefix: '/api/profile' });
  await fastify.register(contactsRoutes, { prefix: '/api/contacts' });
  await fastify.register(journeysRoutes, { prefix: '/api/journeys' });
  await fastify.register(trackingRoutes, { prefix: '/api/location' });
  await fastify.register(sosRoutes, { prefix: '/api/sos' });
  await fastify.register(notificationsRoutes, { prefix: '/api/notifications' });
  await fastify.register(checkInsRoutes, { prefix: '/api/checkins' });

  fastify.get('/health', async () => ({ status: 'ok', env: env.NODE_ENV }));

  // Error handler
  fastify.setErrorHandler((error, _request, reply) => {
    const status = error.statusCode ?? 500;
    if (error.name === 'ZodError') {
      return reply.status(400).send({ error: 'Validation failed', details: error.message });
    }
    fastify.log.error(error);
    reply.status(status).send({ error: error.message || 'Internal server error' });
  });

  // ─── Socket.io — must decorate BEFORE fastify.listen() ──────────────────
  const io = new SocketServer(fastify.server, {
    cors: {
      origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
    },
  });
  fastify.decorate('io', io);
  registerSocketHandlers(io);

  // ─── Listen ──────────────────────────────────────────────────────────────
  await fastify.listen({ port: env.PORT, host: '0.0.0.0' });
  console.log(`\n[SafeTrack] API  → http://localhost:${env.PORT}`);
  console.log(`[SafeTrack] Docs → http://localhost:${env.PORT}/docs\n`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
