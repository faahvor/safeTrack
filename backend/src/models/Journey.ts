import mongoose, { Document, Schema, Types } from 'mongoose';

export type JourneyStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface ILocationPoint {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export interface IJourney extends Document {
  userId: Types.ObjectId;
  startLocation: ILocationPoint;
  destination: ILocationPoint;
  meetingPersonName?: string;
  meetingPersonPhone?: string;
  notes?: string;
  estimatedArrivalTime?: Date;
  status: JourneyStatus;
  notifiedContacts: Types.ObjectId[];
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LocationPointSchema = new Schema<ILocationPoint>(
  {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String },
  },
  { _id: false }
);

const JourneySchema = new Schema<IJourney>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startLocation: { type: LocationPointSchema, required: true },
    destination: { type: LocationPointSchema, required: true },
    meetingPersonName: { type: String },
    meetingPersonPhone: { type: String },
    notes: { type: String },
    estimatedArrivalTime: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    notifiedContacts: [{ type: Schema.Types.ObjectId, ref: 'Contact' }],
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

JourneySchema.index({ userId: 1, status: 1 });

export const Journey = mongoose.model<IJourney>('Journey', JourneySchema);
