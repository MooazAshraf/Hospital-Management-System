import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { AppointmentCardComponent } from '../../appointments/appointment-card/appointment-card.component';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,

  imports: [
    CommonModule,
    AppointmentCardComponent,
  ],

  templateUrl: './patient-dashboard.component.html',
})
export class PatientDashboardComponent implements OnInit {

  @Input() user: any = null;

  // ==========================================
  // Dashboard data
  // ==========================================

  upcomingAppointments: any[] = [];

  notifications: any[] = [];

  loading = true;

  errorMessage = '';

  // ==========================================
  // Constructor
  // ==========================================

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ==========================================
  // Init
  // ==========================================

  ngOnInit(): void {
    this.loadUser();
    this.fetchDashboardData();
  }

  // ==========================================
  // Load logged user
  // ==========================================

  private loadUser(): void {

    if (this.user) {
      return;
    }

    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      return;
    }

    try {

      this.user = JSON.parse(savedUser);

    } catch (error) {

      console.error(
        'Failed to parse saved user:',
        error
      );

      this.user = null;
    }
  }

  // ==========================================
  // Fetch dashboard data
  // ==========================================

  fetchDashboardData(): void {

    this.loading = true;
    this.errorMessage = '';

    // ========================================
    // Notifications
    // ========================================

    this.notificationService.getMyNotifications().subscribe({

      next: (res: any) => {

        console.log(
          'Dashboard notifications:',
          res
        );

        this.notifications =
          Array.isArray(res?.notifications)
            ? res.notifications.slice(0, 6)
            : [];

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(
          'Error fetching notifications:',
          err
        );

        this.notifications = [];

        this.cdr.detectChanges();
      },

    });

    // ========================================
    // Appointments
    // ========================================

    this.appointmentService.getAll().subscribe({

      next: (res: any) => {

        console.log(
          '================================'
        );

        console.log(
          'Dashboard appointments response:',
          res
        );

        console.log(
          '================================'
        );

        // ====================================
        // Extract appointments
        // ====================================

        const appointments =
          this.extractAppointments(res);

        console.log(
          'All appointments:',
          appointments
        );

        // ====================================
        // Filter appointments
        // ====================================

        this.upcomingAppointments =
          appointments
            .filter((appointment: any) => {

              if (!appointment) {
                return false;
              }

              // Don't show cancelled
              if (
                appointment.status === 'Cancelled'
              ) {
                return false;
              }

              // Don't show completed
              if (
                appointment.status === 'Completed'
              ) {
                return false;
              }

              // Check valid date
              const appointmentDate =
                this.getAppointmentDateTime(
                  appointment
                );

              if (
                isNaN(
                  appointmentDate.getTime()
                )
              ) {
                return false;
              }

              return true;
            })

            // ==================================
            // Sort by date/time
            // ==================================

            .sort((a: any, b: any) => {

              return (
                this.getAppointmentDateTime(a).getTime() -
                this.getAppointmentDateTime(b).getTime()
              );

            });

        console.log(
          'Appointments shown on dashboard:',
          this.upcomingAppointments
        );

        console.log(
          'Appointments count:',
          this.upcomingAppointments.length
        );

        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {

        console.error(
          'Error fetching appointments:',
          err
        );

        this.upcomingAppointments = [];

        this.errorMessage =
          err?.error?.message ||
          'Failed to load appointments';

        this.loading = false;

        this.cdr.detectChanges();
      },

    });
  }

  // ==========================================
  // Extract appointments
  // ==========================================

  private extractAppointments(
    res: any
  ): any[] {

    if (Array.isArray(res)) {
      return res;
    }

    if (Array.isArray(res?.data)) {
      return res.data;
    }

    if (Array.isArray(res?.appointments)) {
      return res.appointments;
    }

    if (
      Array.isArray(
        res?.data?.appointments
      )
    ) {
      return res.data.appointments;
    }

    return [];
  }

  // ==========================================
  // Convert appointment date/time
  // ==========================================

  private getAppointmentDateTime(
    appointment: any
  ): Date {

    const date =
      appointment?.date || '';

    const time =
      appointment?.time || '00:00';

    return new Date(
      `${date}T${time}`
    );
  }

  // ==========================================
  // Cancel appointment
  // ==========================================

  cancelAppointment(
    id: string
  ): void {

    if (!id) {
      return;
    }

    const confirmed =
      confirm(
        'Are you sure you want to cancel this appointment?'
      );

    if (!confirmed) {
      return;
    }

    // ========================================
    // Send cancel request
    // ========================================

    this.appointmentService.cancel(id).subscribe({

      next: (res: any) => {

        console.log(
          'Appointment cancelled successfully:',
          res
        );

        // ====================================
        // Remove appointment immediately
        // ====================================

        this.upcomingAppointments =
          this.upcomingAppointments.filter(
            (appointment: any) => {

              const appointmentId =
                appointment?._id ||
                appointment?.id;

              return appointmentId !== id;
            }
          );

        // ====================================
        // Update UI immediately
        // ====================================

        this.cdr.detectChanges();

      },

      error: (err) => {

        console.error(
          'Cancel appointment error:',
          err
        );

        this.errorMessage =
          err?.error?.message ||
          'Failed to cancel appointment';

        this.cdr.detectChanges();
      },

    });
  }

  // ==========================================
  // Track appointments
  // ==========================================

  trackAppointment(
    index: number,
    appointment: any
  ): string {

    return (
      appointment?._id ||
      appointment?.id ||
      `${appointment?.doctor?._id || appointment?.doctor}-${appointment?.date}-${appointment?.time}-${index}`
    );
  }
}