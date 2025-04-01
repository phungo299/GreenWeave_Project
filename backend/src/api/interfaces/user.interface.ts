import { Document } from 'mongoose';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateAuthToken(): string;
}

export interface IUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface ILoginInput {
  email: string;
  password: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface IResetPasswordInput {
  token: string;
  password: string;
}

export interface IChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface IUpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
} 