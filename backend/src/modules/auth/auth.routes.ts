import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';
import { RegisterSchema, LoginSchema } from './auth.schema.js';
import { registerUser, loginUser, getMe } from './auth.service.js';
import { authenticate } from '../../middleware/authenticate.js';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    try {
      const body = RegisterSchema.parse(request.body);
      const user = await registerUser(body);
      const token = fastify.jwt.sign({ id: user._id, email: user.email });
      return reply.status(201).send({ user, token });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: err.errors[0]?.message || 'Validation failed' });
      }
      return reply.status(400).send({ message: err.message || 'Registration failed' });
    }
  });

  fastify.post('/login', async (request, reply) => {
    try {
      const body = LoginSchema.parse(request.body);
      const user = await loginUser(body);
      const token = fastify.jwt.sign({ id: user._id, email: user.email });
      return reply.send({ user, token });
    } catch (err: any) {
      if (err instanceof ZodError) {
        return reply.status(400).send({ error: err.errors[0]?.message || 'Validation failed' });
      }
      return reply.status(401).send({ message: err.message || 'Invalid credentials' });
    }
  });

  fastify.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const { id } = request.user as { id: string };
    const user = await getMe(id);
    return reply.send({ user });
  });
}
