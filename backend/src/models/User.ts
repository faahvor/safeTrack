import mongoose, { Document, Schema } from 'mongoose';

export interface ICondition { name: string; notes: string; }
export interface IMedication { name: string; dosage: string; purpose: string; }
export interface ISurgery { name: string; year: string; }
export interface IPerContactPrivacy {
  contactId: string;
  location: boolean; status: boolean; bloodType: boolean;
  allergies: boolean; conditions: boolean; medications: boolean; surgeries: boolean;
}

export interface IMedical {
  bloodType?: string;
  allergies: string[];
  conditions: ICondition[];
  medications: IMedication[];
  surgeries: ISurgery[];
}

export interface ISOSPrivacy {
  sendLocation: boolean;
  sendStatus: boolean;
  sendHealth: boolean;
  includeBloodType: boolean;
  includeAllergies: boolean;
  includeConditions: boolean;
  includeMedications: boolean;
  includeSurgeries: boolean;
  perContact: IPerContactPrivacy[];
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar?: string;
  medical: IMedical;
  sosPrivacy: ISOSPrivacy;
  createdAt: Date;
  updatedAt: Date;
}

const PerContactPrivacySchema = new Schema<IPerContactPrivacy>({
  contactId: { type: String, required: true },
  location: { type: Boolean, default: true },
  status: { type: Boolean, default: true },
  bloodType: { type: Boolean, default: true },
  allergies: { type: Boolean, default: true },
  conditions: { type: Boolean, default: true },
  medications: { type: Boolean, default: false },
  surgeries: { type: Boolean, default: false },
}, { _id: false });

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String },
    medical: {
      bloodType: { type: String },
      allergies: { type: [String], default: [] },
      conditions: { type: [{ name: String, notes: String }], default: [] },
      medications: { type: [{ name: String, dosage: String, purpose: String }], default: [] },
      surgeries: { type: [{ name: String, year: String }], default: [] },
    },
    sosPrivacy: {
      sendLocation: { type: Boolean, default: true },
      sendStatus: { type: Boolean, default: true },
      sendHealth: { type: Boolean, default: true },
      includeBloodType: { type: Boolean, default: true },
      includeAllergies: { type: Boolean, default: true },
      includeConditions: { type: Boolean, default: true },
      includeMedications: { type: Boolean, default: false },
      includeSurgeries: { type: Boolean, default: false },
      perContact: { type: [PerContactPrivacySchema], default: [] },
    },
  },
  { timestamps: true }
);


export const User = mongoose.model<IUser>('User', UserSchema);
