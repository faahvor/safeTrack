import { z } from 'zod';
import { Contact } from '../../models/Contact.js';

const PermissionsSchema = z.object({
  location: z.boolean().default(true),
  journeyUpdates: z.boolean().default(true),
  emergencyAlerts: z.boolean().default(true),
});

export const CreateContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  permissions: PermissionsSchema.optional(),
});

export const UpdateContactSchema = CreateContactSchema.partial();

export type CreateContactInput = z.infer<typeof CreateContactSchema>;
export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;

export async function getContacts(ownerId: string) {
  return Contact.find({ ownerId }).sort({ createdAt: -1 });
}

export async function createContact(ownerId: string, data: CreateContactInput) {
  return Contact.create({ ownerId, ...data });
}

export async function updateContact(ownerId: string, contactId: string, data: UpdateContactInput) {
  const contact = await Contact.findOneAndUpdate(
    { _id: contactId, ownerId },
    { $set: data },
    { new: true, runValidators: true }
  );
  if (!contact) throw new Error('Contact not found');
  return contact;
}

export async function deleteContact(ownerId: string, contactId: string) {
  const contact = await Contact.findOneAndDelete({ _id: contactId, ownerId });
  if (!contact) throw new Error('Contact not found');
  return { deleted: true };
}
