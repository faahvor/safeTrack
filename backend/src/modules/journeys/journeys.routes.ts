import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import {
  CreateJourneySchema,
  createJourney, getJourneys, getJourneyById, updateJourney, endJourney,
} from './journeys.service.js';

export async function journeysRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.post('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = CreateJourneySchema.parse(request.body);
    return reply.status(201).send(await createJourney(id, body));
  });

  fastify.get('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getJourneys(id));
  });

  fastify.get('/:journeyId', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { journeyId } = request.params as { journeyId: string };
    return reply.send(await getJourneyById(id, journeyId));
  });

  fastify.put('/:journeyId', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { journeyId } = request.params as { journeyId: string };
    const body = CreateJourneySchema.partial().parse(request.body);
    return reply.send(await updateJourney(id, journeyId, body));
  });

  fastify.patch('/:journeyId/end', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { journeyId } = request.params as { journeyId: string };
    return reply.send(await endJourney(id, journeyId));
  });
}
