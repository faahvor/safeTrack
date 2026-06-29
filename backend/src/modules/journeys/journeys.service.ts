import { z } from 'zod';
import { Journey } from '../../models/Journey.js';

const LocationPointSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const CreateJourneySchema = z.object({
  startLocation: LocationPointSchema,
  destination: LocationPointSchema,
  meetingPersonName: z.string().optional(),
  meetingPersonPhone: z.string().optional(),
  notes: z.string().optional(),
  estimatedArrivalTime: z.string().datetime().optional(),
  notifiedContacts: z.array(z.string()).optional(),
});

export type CreateJourneyInput = z.infer<typeof CreateJourneySchema>;

export async function createJourney(userId: string, data: CreateJourneyInput) {
  return Journey.create({
    userId,
    ...data,
    estimatedArrivalTime: data.estimatedArrivalTime ? new Date(data.estimatedArrivalTime) : undefined,
    status: 'active',
    startedAt: new Date(),
  });
}

export async function getJourneys(userId: string) {
  return Journey.find({ userId }).sort({ createdAt: -1 });
}

export async function getJourneyById(userId: string, journeyId: string) {
  const journey = await Journey.findOne({ _id: journeyId, userId });
  if (!journey) throw new Error('Journey not found');
  return journey;
}

export async function updateJourney(userId: string, journeyId: string, data: Partial<CreateJourneyInput>) {
  const journey = await Journey.findOneAndUpdate(
    { _id: journeyId, userId },
    { $set: data },
    { new: true }
  );
  if (!journey) throw new Error('Journey not found');
  return journey;
}

export async function endJourney(userId: string, journeyId: string) {
  const journey = await Journey.findOneAndUpdate(
    { _id: journeyId, userId, status: 'active' },
    { $set: { status: 'completed', endedAt: new Date() } },
    { new: true }
  );
  if (!journey) throw new Error('Journey not found or already ended');
  return journey;
}
