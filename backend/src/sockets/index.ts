import type { Server } from 'socket.io';
import { LocationTrack } from '../models/LocationTrack.js';
import { Journey } from '../models/Journey.js';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket) => {
    const userId = socket.handshake.auth?.userId as string | undefined;

    socket.on('journey:join', (journeyId: string) => {
      socket.join(`journey:${journeyId}`);
    });

    socket.on('journey:leave', (journeyId: string) => {
      socket.leave(`journey:${journeyId}`);
    });

    // Save location + broadcast to journey room
    socket.on('location:update', async (data: { journeyId: string; latitude: number; longitude: number }) => {
      try {
        if (!userId) return;
        // Verify this user owns the journey
        const journey = await Journey.findOne({ _id: data.journeyId, userId });
        if (!journey) return;

        await LocationTrack.create({
          journeyId: data.journeyId,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        io.to(`journey:${data.journeyId}`).emit('location:updated', {
          journeyId: data.journeyId,
          latitude: data.latitude,
          longitude: data.longitude,
          timestamp: new Date().toISOString(),
        });
      } catch (err) {
        socket.emit('error', { message: 'Failed to save location' });
      }
    });

    socket.on('journey:start', (data: { journeyId: string }) => {
      socket.join(`journey:${data.journeyId}`);
      io.to(`journey:${data.journeyId}`).emit('journey:updated', { journeyId: data.journeyId, status: 'active' });
    });

    socket.on('journey:end', async (data: { journeyId: string }) => {
      try {
        if (!userId) return;
        // Only update if this user owns the journey
        await Journey.findOneAndUpdate(
          { _id: data.journeyId, userId },
          { status: 'completed', endedAt: new Date() }
        );
        io.to(`journey:${data.journeyId}`).emit('journey:updated', { journeyId: data.journeyId, status: 'completed' });
        socket.leave(`journey:${data.journeyId}`);
      } catch (err) {
        socket.emit('error', { message: 'Failed to end journey' });
      }
    });

    // Only broadcast SOS for the authenticated user's own events
    socket.on('sos:trigger', (data: { location: object }) => {
      if (!userId) return;
      io.emit('sos:alert', { userId, location: data.location });
    });
  });
}
