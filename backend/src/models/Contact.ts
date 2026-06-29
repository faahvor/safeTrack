import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IContact extends Document {
  ownerId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  permissions: {
    location: boolean;
    journeyUpdates: boolean;
    emergencyAlerts: boolean;
  };
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    permissions: {
      location: { type: Boolean, default: true },
      journeyUpdates: { type: Boolean, default: true },
      emergencyAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ContactSchema.index({ ownerId: 1, email: 1 }, { unique: true });

export const Contact = mongoose.model<IContact>('Contact', ContactSchema);
