export interface Appointment {
  _id?: string;
  patient?: any;
  doctor?: any;
  date: string;
  time: string;
  status?: 'Pending' | 'Completed' | 'Cancelled' | 'Confirmed';
  appointmentType?: string;
  queueNumber?: number;
  notes?: string;
  diagnosis?: string;
  isFollowUpAllowed?: boolean;
  followUpDeadline?: string;
}