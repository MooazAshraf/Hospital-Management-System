export type AppointmentStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Completed'
  | 'Cancelled';

export type AppointmentType =
  | 'Consultation'
  | 'Follow-up'
  | 'Check-up';

export interface AppointmentDoctor {
  _id: string;
  name?: string;
  specialty?: string;
  image?: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
}

export interface AppointmentPatient {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
}

export interface Appointment {
  _id: string;

  patient:
    | string
    | AppointmentPatient;

  doctor:
    | string
    | AppointmentDoctor;

  date: string;
  time: string;

  appointmentType: AppointmentType;

  notes?: string;

  status: AppointmentStatus;

  queueNumber?: number;

  slotKey?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAppointmentPayload {
  doctor: string;
  date: string;
  time: string;
  appointmentType: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  date?: string;
  time?: string;
  appointmentType?: AppointmentType;
  notes?: string;
  status?: AppointmentStatus;
}

export interface AppointmentResponse {
  success?: boolean;
  message: string;
  data: Appointment;
  appointment?: Appointment;
}

export interface AppointmentListResponse {
  success?: boolean;
  message?: string;
  count?: number;
  data: Appointment[];
  appointments?: Appointment[];
}

export interface AvailableSlotsResponse {
  success?: boolean;
  message?: string;
  data: {
    doctor: string;
    date: string;
    bookedTimes: string[];
    availableTimes?: string[];
  };
}