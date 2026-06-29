import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../middleware/authenticate.js';
import {
  CreateContactSchema, UpdateContactSchema,
  getContacts, createContact, updateContact, deleteContact,
} from './contacts.service.js';

export async function contactsRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticate);

  fastify.get('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    return reply.send(await getContacts(id));
  });

  fastify.post('/', async (request, reply) => {
    const { id } = request.user as { id: string };
    const body = CreateContactSchema.parse(request.body);
    return reply.status(201).send(await createContact(id, body));
  });

  fastify.put('/:contactId', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { contactId } = request.params as { contactId: string };
    const body = UpdateContactSchema.parse(request.body);
    return reply.send(await updateContact(id, contactId, body));
  });

  fastify.delete('/:contactId', async (request, reply) => {
    const { id } = request.user as { id: string };
    const { contactId } = request.params as { contactId: string };
    return reply.send(await deleteContact(id, contactId));
  });
}
