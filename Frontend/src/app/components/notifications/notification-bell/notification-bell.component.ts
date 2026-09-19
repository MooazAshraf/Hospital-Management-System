import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

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
  private router = inject(Router);
  private elementRef = inject(ElementRef);

  notifications: AppNotification[] = [];

  isOpen = false;
  isLoading = false;
  isMarkingAll = false;

  errorMessage: string | null = null;

  // Prevent unnecessary first/repeated requests
  private hasLoadedNotifications = false;

  // =========================
  // Unread Notifications Count
  // =========================
  get unreadCount(): number {
    return this.notifications.filter(
      notification => !notification.isRead
    ).length;
  }

  // =========================
  // Init
  // =========================
  ngOnInit(): void {
    this.loadNotifications();
  }

  // =========================
  // Load Notifications
  // =========================
  loadNotifications(force = false): void {

    // Don't send another request while one is already running
    if (this.isLoading) {
      return;
    }

    // Don't reload if notifications were already loaded
    // unless force=true
    if (
      this.hasLoadedNotifications &&
      !force
    ) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    this.notificationService
      .getMyNotifications()
      .subscribe({

        next: (response) => {

          console.log(
            'Notifications response:',
            response
          );

          this.notifications =
            response.notifications || [];

          this.hasLoadedNotifications = true;

          this.isLoading = false;
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to load notifications:',
            err
          );

          this.notifications = [];

          this.errorMessage =
            err.error?.message ||
            'Failed to load notifications.';

          this.isLoading = false;
        }

      });
  }

  // =========================
  // Toggle Dropdown
  // =========================
  toggleDropdown(event?: Event): void {

    event?.stopPropagation();

    this.isOpen = !this.isOpen;

    /*
     * IMPORTANT:
     * We DO NOT call loadNotifications() here.
     *
     * Notifications are loaded once in ngOnInit().
     * The refresh button can be used to reload them.
     */
  }

  // =========================
  // Close When Click Outside
  // =========================
  @HostListener(
    'document:click',
    ['$event']
  )
  onDocumentClick(event: MouseEvent): void {

    const clickedInside =
      this.elementRef.nativeElement.contains(
        event.target
      );

    if (!clickedInside) {
      this.isOpen = false;
    }
  }

  // =========================
  // Close With Escape
  // =========================
  @HostListener(
    'document:keydown.escape'
  )
  onEscape(): void {

    this.isOpen = false;
  }

  // =========================
  // Click Notification
  // =========================
  onNotificationClick(
    notification: AppNotification
  ): void {

    // Already read
    if (notification.isRead) {

      this.navigateFromNotification(
        notification
      );

      return;
    }

    // Mark as read first
    this.notificationService
      .markAsRead(notification._id)
      .subscribe({

        next: () => {

          notification.isRead = true;

          this.navigateFromNotification(
            notification
          );
        },

        error: (err: HttpErrorResponse) => {

          console.error(
            'Failed to mark notification as read:',
            err
          );
        }

      });
  }

  // =========================
  // Navigate Based On Type
  // =========================
  private navigateFromNotification(
    notification: AppNotification
  ): void {

    // Appointment
    if (
      notification.type === 'appointment' &&
      notification.relatedAppointment
    ) {

      const appointmentId =
        notification.relatedAppointment;

      this.isOpen = false;

      this.router.navigate([
        '/appointments',
        appointmentId
      ]);

      return;
    }

    // Medical Report
    if (
      notification.type === 'medical-report' &&
      notification.relatedMedicalReport
    ) {

      const medicalReportId =
        notification.relatedMedicalReport;

      this.isOpen = false;

      this.router.navigate([
        '/medical-reports',
        medicalReportId
      ]);

      return;
    }
  }

  // =========================
  // Mark All As Read
  // =========================
  markAllAsRead(): void {

    if (
      this.unreadCount === 0 ||
      this.isMarkingAll
    ) {
      return;
    }

    this.isMarkingAll = true;

    this.notificationService
      .markAllAsRead()
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

  // =========================
  // Delete Notification
  // =========================
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

  // =========================
  // Refresh
  // =========================
  refreshNotifications(
    event?: Event
  ): void {

    event?.stopPropagation();

    this.loadNotifications(true);
  }

  // =========================
  // Try Again
  // =========================
  retryNotifications(): void {

    this.loadNotifications(true);
  }

  // =========================
  // Notification Icon
  // =========================
  getNotificationIcon(
    type: NotificationType
  ): string {

    switch (type) {

      case 'appointment':
        return '📅';

      case 'medical-report':
        return '📄';

      case 'payment':
        return '💳';

      case 'system':
        return '⚙️';

      default:
        return '🔔';
    }
  }

  // =========================
  // Format Date
  // =========================
  formatDate(
    date: string
  ): string {

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

  // =========================
  // Track Notifications
  // =========================
  trackByNotificationId(
    index: number,
    notification: AppNotification
  ): string {

    return notification._id;
  }
}