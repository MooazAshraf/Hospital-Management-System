
export type NotificationType =
  | 'appointment'
  | 'medical-report'
  | 'payment'
  | 'system';


export interface NotificationUser {

  _id: string;

  name?: string;

  role?: string;

}


export interface AppNotification {

  _id: string;
  recipient: string | NotificationUser;
  sender?: string | NotificationUser | null;
  title: string;

  message: string;
  type: NotificationType;
  relatedAppointment?: string | unknown | null;
  relatedMedicalReport?: string | unknown | null;
  isRead: boolean;
  createdAt: string;

  updatedAt?: string;

}


export interface NotificationsListResponse {
  success?: boolean;
  message?: string;
  count: number;

  notifications: AppNotification[];

}


export interface NotificationResponse {
  success?: boolean;
  message: string;
  notification: AppNotification;

}
