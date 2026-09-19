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
  recipient: string;
  sender: NotificationUser | null;

  title: string;
  message: string;
  type: NotificationType;

  isRead: boolean;

  relatedAppointment?: string | null;
  relatedMedicalReport?: string | null;

  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsListResponse {
  success: boolean;
  count: number;
  notifications: AppNotification[];
}

export interface NotificationResponse {
  success: boolean;
  message?: string;
  notification: AppNotification;
}

export interface SimpleMessageResponse {
  success: boolean;
  message: string;
}