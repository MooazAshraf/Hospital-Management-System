export interface Iuser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: 'user' | 'doctor' | 'admin';
  isActive: boolean;
  lastLoginDate: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
