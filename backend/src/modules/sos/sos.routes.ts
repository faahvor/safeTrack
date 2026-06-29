import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { TriggerSOSSchema, triggerSOS, getSOSHistory, resolveSOSEvent } from './sos.service.js';

export async function sosRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = TriggerSOSSchema.parse(request.body);
    const event = await triggerSOS(id, body);
    // Notify connected sockets
    fastify.io?.emit('sos:alert', { userId: id, location: body, eventId: event._id });
    return reply.status(201).send(event);
  });

  fastify.get('/history', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getSOSHistory(id));
  });

  fastify.patch('/:sosId/resolve', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { sosId } = request.params as { sosId: string };
    return reply.send(await resolveSOSEvent(id, sosId));
  });
}
