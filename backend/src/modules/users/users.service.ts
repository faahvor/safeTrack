import { z } from 'zod';
import { User } from '../../models/User.js';

export const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().min(7).max(20).optional(),
  avatar: z.string().url().optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

export const UpdateMedicalSchema = z.object({
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.object({ name: z.string(), notes: z.string() })).optional(),
  medications: z.array(z.object({ name: z.string(), dosage: z.string(), purpose: z.string() })).optional(),
  surgeries: z.array(z.object({ name: z.string(), year: z.string() })).optional(),
});

export type UpdateMedicalInput = z.infer<typeof UpdateMedicalSchema>;

export const UpdateSOSPrivacySchema = z.object({
  sendLocation: z.boolean().optional(),
  sendStatus: z.boolean().optional(),
  sendHealth: z.boolean().optional(),
  includeBloodType: z.boolean().optional(),
  includeAllergies: z.boolean().optional(),
  includeConditions: z.boolean().optional(),
  includeMedications: z.boolean().optional(),
  includeSurgeries: z.boolean().optional(),
  perContact: z.array(z.object({
    contactId: z.string(),
    location: z.boolean(),
    status: z.boolean(),
    bloodType: z.boolean(),
    allergies: z.boolean(),
    conditions: z.boolean(),
    medications: z.boolean(),
    surgeries: z.boolean(),
  })).optional(),
});

export type UpdateSOSPrivacyInput = z.infer<typeof UpdateSOSPrivacySchema>;

export async function getProfile(userId: string) {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
}

export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await User.findByIdAndUpdate(userId, { $set: data }, { new: true, runValidators: true }).select('-password');
  if (!user) throw new Error('User not found');
  return user;
}

export async function getMedical(userId: string) {
  const user = await User.findById(userId).select('medical');
  if (!user) throw new Error('User not found');
  return user.medical;
}

export async function updateMedical(userId: string, data: UpdateMedicalInput) {
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) update[`medical.${k}`] = v;
  }
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true }).select('medical');
  if (!user) throw new Error('User not found');
  return user.medical;
}

export async function getSOSPrivacy(userId: string) {
  const user = await User.findById(userId).select('sosPrivacy');
  if (!user) throw new Error('User not found');
  return user.sosPrivacy;
}

export async function updateSOSPrivacy(userId: string, data: UpdateSOSPrivacyInput) {
  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    if (v !== undefined) update[`sosPrivacy.${k}`] = v;
  }
  const user = await User.findByIdAndUpdate(userId, { $set: update }, { new: true, runValidators: true }).select('sosPrivacy');
  if (!user) throw new Error('User not found');
  return user.sosPrivacy;
}
