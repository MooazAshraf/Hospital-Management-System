export interface DoctorAvailability {
  day:
    | 'Saturday'
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday';

  startTime: string;
  endTime: string;
}

export interface DoctorUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface DoctorDepartment {
  _id: string;
  name: string;
}

export interface Doctor {
  _id: string;

  user:
    | string
    | DoctorUser;

  name: string;

  specialty: string;

  department:
    | string
    | DoctorDepartment;

  email: string;

  phone: string;

  description?: string;

  fees: number;

  qualifications: string[];

  roomNumber?: string;

  experienceYears: number;

  isAvailable: boolean;

  availability: DoctorAvailability[];

  image?: string;
}