export interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPermissions {
  location: boolean;
  journeyUpdates: boolean;
  emergencyAlerts: boolean;
}

export interface Contact {
  _id: string;
  ownerId: string;
  name: string;
  email: string;
  phone: string;
  permissions: ContactPermissions;
  createdAt: string;
}

export interface LocationPoint {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export type JourneyStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Journey {
  _id: string;
  userId: string;
  startLocation: LocationPoint;
  destination: LocationPoint;
  meetingPersonName?: string;
  meetingPersonPhone?: string;
  notes?: string;
  estimatedArrivalTime?: string;
  status: JourneyStatus;
  notifiedContacts: string[];
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationTrack {
  _id: string;
  journeyId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export type SOSStatus = 'active' | 'resolved';

export interface SOSEvent {
  _id: string;
  userId: string;
  location: LocationPoint;
  status: SOSStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface MedicalCondition { name: string; notes: string; }
export interface MedicalMedication { name: string; dosage: string; purpose: string; }
export interface MedicalSurgery { name: string; year: string; }

export interface Medical {
  bloodType?: string;
  allergies: string[];
  conditions: MedicalCondition[];
  medications: MedicalMedication[];
  surgeries: MedicalSurgery[];
}

export interface PerContactPrivacy {
  contactId: string;
  location: boolean; status: boolean; bloodType: boolean;
  allergies: boolean; conditions: boolean; medications: boolean; surgeries: boolean;
}

export interface SOSPrivacy {
  sendLocation: boolean;
  sendStatus: boolean;
  sendHealth: boolean;
  includeBloodType: boolean;
  includeAllergies: boolean;
  includeConditions: boolean;
  includeMedications: boolean;
  includeSurgeries: boolean;
  perContact: PerContactPrivacy[];
}

export type NotificationType = 'sos' | 'journey' | 'warning' | 'info' | 'contact';

export interface AppNotification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface CheckIn {
  _id: string;
  userId: string;
  journeyId?: string;
  message: string;
  createdAt: string;
}
