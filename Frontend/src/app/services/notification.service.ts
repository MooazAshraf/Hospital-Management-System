import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AppNotification,
  CreateNotificationPayload,
  NotificationResponse,
  NotificationsListResponse
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl =
    'http://localhost:5000/api/notifications';

  constructor(private http: HttpClient) {}

  // Get all notifications for a specific user
  getNotificationsByUser(
    userId: string
  ): Observable<NotificationsListResponse> {

    return this.http.get<NotificationsListResponse>(
      `${this.baseUrl}/user/${userId}`
    );
  }

  // Get one notification by ID
  getNotificationById(
    notificationId: string
  ): Observable<NotificationResponse> {

    return this.http.get<NotificationResponse>(
      `${this.baseUrl}/${notificationId}`
    );
  }

  // Create a new notification
  createNotification(
    payload: CreateNotificationPayload
  ): Observable<NotificationResponse> {

    return this.http.post<NotificationResponse>(
      this.baseUrl,
      payload
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

  // Mark all user notifications as read
  markAllAsRead(
    userId: string
  ): Observable<{ message: string }> {

    return this.http.patch<{ message: string }>(
      `${this.baseUrl}/user/${userId}/read-all`,
      {}
    );
  }

  // Delete one notification
  deleteNotification(
    notificationId: string
  ): Observable<{ message: string }> {

    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${notificationId}`
    );
  }
}