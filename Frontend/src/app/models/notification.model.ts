export type NotificationType =
  | 'appointment'
  | 'prescription'
  | 'medicalReport'
  | 'payment'
  | 'system';

export interface NotificationUser {
  _id: string;
  name?: string;
  email?: string;
  role?: string;
}

export interface AppNotification {
  _id: string;

  user: string | NotificationUser;

  title: string;
  message: string;

  type: NotificationType;

  isRead: boolean;

  relatedId?: string;

  createdAt: string;
  updatedAt?: string;
}

export interface NotificationsListResponse {
  message: string;
  count: number;
  notifications: AppNotification[];
}

export interface NotificationResponse {
  message: string;
  notification: AppNotification;
}

export interface CreateNotificationPayload {
  user: string;
  title: string;
  message: string;

  type?: NotificationType;

  relatedId?: string;
}

export interface UpdateNotificationPayload {
  isRead?: boolean;
}