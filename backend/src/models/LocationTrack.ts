import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ILocationTrack extends Document {
  journeyId: Types.ObjectId;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const LocationTrackSchema = new Schema<ILocationTrack>({
  journeyId: { type: Schema.Types.ObjectId, ref: 'Journey', required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

LocationTrackSchema.index({ journeyId: 1, timestamp: 1 });

export const LocationTrack = mongoose.model<ILocationTrack>('LocationTrack', LocationTrackSchema);
