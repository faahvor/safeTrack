import { z } from 'zod';
import { LocationTrack } from '../../models/LocationTrack.js';
import { Journey } from '../../models/Journey.js';

export const UpdateLocationSchema = z.object({
  journeyId: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export type UpdateLocationInput = z.infer<typeof UpdateLocationSchema>;

export async function saveLocation(userId: string, data: UpdateLocationInput) {
  const journey = await Journey.findOne({ _id: data.journeyId, userId, status: 'active' });
  if (!journey) throw new Error('Active journey not found');

  const track = await LocationTrack.create({
    journeyId: data.journeyId,
    latitude: data.latitude,
    longitude: data.longitude,
  });
  return track;
}

export async function getLatestLocation(userId: string) {
  const journey = await Journey.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });
  if (!journey) {
    const lastJourney = await Journey.findOne({ userId }).sort({ createdAt: -1 });
    if (!lastJourney) return null;
    const track = await LocationTrack.findOne({ journeyId: lastJourney._id }).sort({ timestamp: -1 });
    return track ? { ...track.toObject(), journeyId: lastJourney._id, isActive: false } : null;
  }
  const track = await LocationTrack.findOne({ journeyId: journey._id }).sort({ timestamp: -1 });
  return track ? { ...track.toObject(), isActive: true } : null;
}

export async function getLocationHistory(userId: string, journeyId: string) {
  const journey = await Journey.findOne({ _id: journeyId, userId });
  if (!journey) throw new Error('Journey not found');
  return LocationTrack.find({ journeyId }).sort({ timestamp: 1 });
}
