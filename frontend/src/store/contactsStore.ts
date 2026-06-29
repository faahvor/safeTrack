import { create } from 'zustand';
import type { Contact } from '@/types';

interface ContactsState {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;
}

export const useContactsStore = create<ContactsState>((set) => ({
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  addContact: (contact) => set((s) => ({ contacts: [contact, ...s.contacts] })),
  updateContact: (id, updates) =>
    set((s) => ({
      contacts: s.contacts.map((c) => (c._id === id ? { ...c, ...updates } : c)),
    })),
  removeContact: (id) =>
    set((s) => ({ contacts: s.contacts.filter((c) => c._id !== id) })),
}));
