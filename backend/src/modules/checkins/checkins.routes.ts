import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../../middleware/authenticate.js';
import { CheckIn } from '../../models/CheckIn.js';

const CreateCheckInSchema = z.object({
  journeyId: z.string().optional(),
  message: z.string().default("I'm safe!"),
});

export async function checkInsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const checkins = await CheckIn.find({ userId: id }).sort({ createdAt: -1 }).limit(50);
    return reply.send(checkins);
  });

  fastify.post('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = CreateCheckInSchema.parse(request.body);
    const checkin = await CheckIn.create({ userId: id, ...body });
    return reply.status(201).send(checkin);
  });
}
