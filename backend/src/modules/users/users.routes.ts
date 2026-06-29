import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import {
  UpdateProfileSchema, getProfile, updateProfile,
  UpdateMedicalSchema, getMedical, updateMedical,
  UpdateSOSPrivacySchema, getSOSPrivacy, updateSOSPrivacy,
} from './users.service.js';

export async function usersRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getProfile(id));
  });

  fastify.put('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = UpdateProfileSchema.parse(request.body);
    return reply.send(await updateProfile(id, body));
  });

  fastify.get('/medical', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getMedical(id));
  });

  fastify.put('/medical', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = UpdateMedicalSchema.parse(request.body);
    return reply.send(await updateMedical(id, body));
  });

  fastify.get('/sos-privacy', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getSOSPrivacy(id));
  });

  fastify.put('/sos-privacy', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = UpdateSOSPrivacySchema.parse(request.body);
    return reply.send(await updateSOSPrivacy(id, body));
  });
}
