import { z } from 'zod';
import { SOSEvent } from '../../models/SOSEvent.js';
import { Contact } from '../../models/Contact.js';
import { User } from '../../models/User.js';
import { sendSOSAlert } from '../notifications/notifications.service.js';

export const TriggerSOSSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

export type TriggerSOSInput = z.infer<typeof TriggerSOSSchema>;

export async function triggerSOS(userId: string, data: TriggerSOSInput) {
  const event = await SOSEvent.create({
    userId,
    location: data,
    status: 'active',
  });

  // Fire-and-forget email notifications
  const [user, contacts] = await Promise.all([
    User.findById(userId).select('name'),
    Contact.find({ ownerId: userId, 'permissions.emergencyAlerts': true }).select('email'),
  ]);

  if (user && contacts.length > 0) {
    sendSOSAlert({
      to: contacts.map((c) => c.email),
      userName: user.name,
      location: data,
    }).catch(console.error);
  }

  return event;
}

export async function getSOSHistory(userId: string) {
  return SOSEvent.find({ userId }).sort({ createdAt: -1 });
}

export async function resolveSOSEvent(userId: string, sosId: string) {
  const event = await SOSEvent.findOneAndUpdate(
    { _id: sosId, userId, status: 'active' },
    { $set: { status: 'resolved', resolvedAt: new Date() } },
    { new: true }
  );
  if (!event) throw new Error('SOS event not found or already resolved');
  return event;
}
