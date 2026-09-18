
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


  get unreadCount(): number {

    return this.notifications.filter(
      notification => !notification.isRead
    ).length;

  }


  ngOnInit(): void {

    this.loadNotifications();

  }


  loadNotifications(): void {

    this.isLoading = true;

    this.errorMessage = null;

    this.notificationService
      .getMyNotifications()
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


  toggleDropdown(event?: Event): void {

    event?.stopPropagation();

    this.isOpen = !this.isOpen;

    if (this.isOpen) {

      this.loadNotifications();

    }

  }


  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {

    const clickedInside =
      this.elementRef.nativeElement.contains(
        event.target
      );

    if (!clickedInside) {

      this.isOpen = false;

    }

  }


  @HostListener('document:keydown.escape')
  onEscape(): void {

    this.isOpen = false;

  }


  onNotificationClick(
    notification: AppNotification
  ): void {

    if (notification.isRead) {

      this.navigateFromNotification(
        notification
      );

      return;

    }


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


  private navigateFromNotification(
    notification: AppNotification
  ): void {

    if (
      notification.type === 'appointment' &&
      notification.relatedAppointment
    ) {

      const appointmentId =
        typeof notification.relatedAppointment === 'string'
          ? notification.relatedAppointment
          : notification.relatedAppointment?._id;

      if (appointmentId) {

        this.isOpen = false;

        this.router.navigate([
          '/appointments',
          appointmentId
        ]);

      }

      return;

    }


    if (
      notification.type === 'medical-report' &&
      notification.relatedMedicalReport
    ) {

      const medicalReportId =
        typeof notification.relatedMedicalReport === 'string'
          ? notification.relatedMedicalReport
          : notification.relatedMedicalReport?._id;

      if (medicalReportId) {

        this.isOpen = false;

        this.router.navigate([
          '/medical-reports',
          medicalReportId
        ]);

      }

    }

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
            'Failed to mark all notifications:',
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


  trackByNotificationId(
    index: number,
    notification: AppNotification
  ): string {

    return notification._id;

  }

}

