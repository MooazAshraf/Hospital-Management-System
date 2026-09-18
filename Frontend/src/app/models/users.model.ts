export interface Iuser {
  _id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'doctor' | 'admin';
  isActive: boolean;
  lastLoginDate: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Review {
  _id: string;

  patient: {
    _id: string;
    name: string;
    email: string;
  };

  doctor: {
    _id: string;
    name: string;
    email: string;
  };

  appointment: any;

  rating: number;
  comment: string;

  createdAt?: Date;
  updatedAt?: Date;
}
