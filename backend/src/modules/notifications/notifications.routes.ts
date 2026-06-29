import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import { Notification } from '../../models/Notification.js';

export async function notificationsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const notifications = await Notification.find({ userId: id }).sort({ createdAt: -1 }).limit(50);
    return reply.send(notifications);
  });

  fastify.patch('/:notifId/read', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { notifId } = request.params as { notifId: string };
    await Notification.updateOne({ _id: notifId, userId: id }, { read: true });
    return reply.send({ ok: true });
  });

  fastify.patch('/read-all', async (request, reply) => {
    const { id } = request.user as { id: string };
    await Notification.updateMany({ userId: id, read: false }, { read: true });
    return reply.send({ ok: true });
  });
}
