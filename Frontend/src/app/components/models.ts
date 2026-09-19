export interface Department {
  name: string;
  description: string;
  doctorsCount: number;
}

export interface Doctor {
  name: string;
  specialty: string;
  experienceYears: number;
}

export interface ReviewUser {
  _id: string;
  name: string;
  email: string;
}

export interface Review {
  _id: string;
  patient: ReviewUser;
  doctor: ReviewUser;
  appointment: any;
  rating: number;
  comment: string;
  createdAt?: Date;
  updatedAt?: Date;
}