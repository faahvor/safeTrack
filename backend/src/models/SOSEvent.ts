import mongoose, { Document, Schema, Types } from 'mongoose';

export type SOSStatus = 'active' | 'resolved';

export interface ISOSEvent extends Document {
  userId: Types.ObjectId;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  status: SOSStatus;
  createdAt: Date;
  resolvedAt?: Date;
}

const SOSEventSchema = new Schema<ISOSEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' },
    resolvedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

SOSEventSchema.index({ userId: 1, status: 1 });

export const SOSEvent = mongoose.model<ISOSEvent>('SOSEvent', SOSEventSchema);
