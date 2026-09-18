import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  NotificationResponse,
  NotificationsListResponse,
  SimpleMessageResponse,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl =
    'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) {}

  // Get current logged-in user's notifications
  getMyNotifications(
    unreadOnly = false
  ): Observable<NotificationsListResponse> {

    const url = unreadOnly
      ? `${this.baseUrl}?unread=true`
      : this.baseUrl;

    return this.http.get<NotificationsListResponse>(url);
  }

  // Get one notification by ID
  getNotificationById(
    notificationId: string
  ): Observable<NotificationResponse> {

    return this.http.get<NotificationResponse>(
      `${this.baseUrl}/${notificationId}`
    );
  }

  // Mark one notification as read
  markAsRead(
    notificationId: string
  ): Observable<NotificationResponse> {

    return this.http.patch<NotificationResponse>(
      `${this.baseUrl}/${notificationId}/read`,
      {}
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<SimpleMessageResponse> {

    return this.http.patch<SimpleMessageResponse>(
      `${this.baseUrl}/read-all`,
      {}
    );
  }

  // Delete one notification
  deleteNotification(
    notificationId: string
  ): Observable<SimpleMessageResponse> {

    return this.http.delete<SimpleMessageResponse>(
      `${this.baseUrl}/${notificationId}`
    );
  }
}