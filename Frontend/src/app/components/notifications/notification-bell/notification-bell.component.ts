import {
  Component,
  Input,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';

import { NotificationService } from '../../../services/notification.service';

import {
  AppNotification,
  NotificationType
} from '../../../models/notification.model';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html'
})
export class NotificationBellComponent implements OnInit {

  private notificationService = inject(NotificationService);

  @Input({ required: true })
  userId!: string;

  notifications: AppNotification[] = [];

  isOpen = false;
  isLoading = false;
  isMarkingAll = false;

  errorMessage: string | null = null;


  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.isRead
    ).length;
  }


  ngOnInit(): void {

    if (!this.userId) {
      this.errorMessage = 'User ID is required.';
      return;
    }

    this.loadNotifications();
  }


  loadNotifications(): void {

    if (!this.userId) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.notificationService
      .getNotificationsByUser(this.userId)
      .subscribe({

        next: (response) => {

          this.notifications =
            response.notifications || [];

          this.isLoading = false;
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to load notifications:',
            err
          );

          this.errorMessage =
            err.error?.message ||
            'Failed to load notifications.';

          this.isLoading = false;
        }

      });
  }


  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }


  onNotificationClick(
    notification: AppNotification
  ): void {

    if (notification.isRead) {
      return;
    }

    this.notificationService
      .markAsRead(notification._id)
      .subscribe({

        next: () => {

          notification.isRead = true;
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to mark notification as read:',
            err
          );
        }

      });
  }


  markAllAsRead(): void {

    if (
      this.unreadCount === 0 ||
      this.isMarkingAll
    ) {
      return;
    }

    this.isMarkingAll = true;

    this.notificationService
      .markAllAsRead(this.userId)
      .subscribe({

        next: () => {

          this.notifications.forEach(
            notification => {
              notification.isRead = true;
            }
          );

          this.isMarkingAll = false;
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to mark all notifications as read:',
            err
          );

          this.isMarkingAll = false;
        }

      });
  }


  deleteNotification(
    notification: AppNotification,
    event: Event
  ): void {

    event.stopPropagation();

    this.notificationService
      .deleteNotification(notification._id)
      .subscribe({

        next: () => {

          this.notifications =
            this.notifications.filter(
              item =>
                item._id !== notification._id
            );
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to delete notification:',
            err
          );
        }

      });
  }


  refreshNotifications(
    event?: Event
  ): void {

    event?.stopPropagation();

    this.loadNotifications();
  }


  getNotificationIcon(
    type: NotificationType
  ): string {

    switch (type) {

      case 'appointment':
        return '📅';

      case 'prescription':
        return '💊';

      case 'medicalReport':
        return '📄';

      case 'payment':
        return '💳';

      case 'system':
        return '⚙️';

      default:
        return '🔔';
    }
  }


  formatDate(date: string): string {

    if (!date) {
      return '';
    }

    return new Date(date).toLocaleString(
      'en-US',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    );
  }
}