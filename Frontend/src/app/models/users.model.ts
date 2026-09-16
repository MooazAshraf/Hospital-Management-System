export interface Iuser {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "doctor" | "admin";
  isActive: boolean;
  lastLoginDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}