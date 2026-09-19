import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  AppNotification,
  NotificationResponse,
  NotificationsListResponse,
} from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private readonly baseUrl =
    'http://localhost:5000/api/notifications';

  constructor(
    private readonly http: HttpClient
  ) {}

  // Get current user's notifications
  getMyNotifications(
    unread = false
  ): Observable<NotificationsListResponse> {

    const suffix = unread
      ? '?unread=true'
      : '';

    return this.http.get<NotificationsListResponse>(
      `${this.baseUrl}${suffix}`
    );
  }

  // Get notification by ID
  getNotificationById(
    id: string
  ): Observable<NotificationResponse> {

    return this.http.get<NotificationResponse>(
      `${this.baseUrl}/${id}`
    );
  }

  // Mark one notification as read
  markAsRead(
    id: string
  ): Observable<NotificationResponse> {

    return this.http.patch<NotificationResponse>(
      `${this.baseUrl}/${id}/read`,
      {}
    );
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<{
    success?: boolean;
    message: string;
  }> {

    return this.http.patch<{
      success?: boolean;
      message: string;
    }>(
      `${this.baseUrl}/read-all`,
      {}
    );
  }

  // Delete notification
  deleteNotification(
    id: string
  ): Observable<{
    success?: boolean;
    message: string;
  }> {

    return this.http.delete<{
      success?: boolean;
      message: string;
    }>(
      `${this.baseUrl}/${id}`
    );
  }
}