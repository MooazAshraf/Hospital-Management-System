import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AppNotification,
  NotificationResponse,
  NotificationsListResponse,
} from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = 'http://localhost:5000/api/notifications';

  constructor(private readonly http: HttpClient) {}

  getMyNotifications(unread = false): Observable<NotificationsListResponse> {
    const suffix = unread ? '?unread=true' : '';
    return this.http.get<NotificationsListResponse>(`${this.baseUrl}${suffix}`);
  }

  getNotificationById(id: string): Observable<NotificationResponse> {
    return this.http.get<NotificationResponse>(`${this.baseUrl}/${id}`);
  }

  markAsRead(id: string): Observable<NotificationResponse> {
    return this.http.patch<NotificationResponse>(`${this.baseUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<{ success?: boolean; message: string }> {
    return this.http.patch<{ success?: boolean; message: string }>(`${this.baseUrl}/read-all`, {});
  }

  deleteNotification(id: string): Observable<{ success?: boolean; message: string }> {
    return this.http.delete<{ success?: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
