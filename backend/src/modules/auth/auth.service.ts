import { User } from '../../models/User.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

export async function registerUser(data: RegisterInput) {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw new Error('Email already registered');

  const hashed = await hashPassword(data.password);
  const user = await User.create({ ...data, password: hashed });
  return { _id: user._id, name: user.name, email: user.email, phone: user.phone };
}

export async function loginUser(data: LoginInput) {
  const user = await User.findOne({ email: data.email });
  if (!user) throw new Error('Invalid credentials');

  const valid = await verifyPassword(data.password, user.password);
  if (!valid) throw new Error('Invalid credentials');

  return { _id: user._id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatar };
}

export async function getMe(userId: string) {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
}
