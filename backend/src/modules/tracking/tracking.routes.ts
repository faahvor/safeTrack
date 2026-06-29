import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { UpdateLocationSchema, saveLocation, getLatestLocation, getLocationHistory } from './tracking.service.js';

export async function trackingRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/update', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = UpdateLocationSchema.parse(request.body);
    return reply.status(201).send(await saveLocation(id, body));
  });

  fastify.get('/latest', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getLatestLocation(id));
  });

  fastify.get('/history/:journeyId', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { journeyId } = request.params as { journeyId: string };
    return reply.send(await getLocationHistory(id, journeyId));
  });
}
