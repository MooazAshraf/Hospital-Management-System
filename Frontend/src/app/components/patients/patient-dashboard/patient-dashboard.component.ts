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
  // Translate notification title
  // ==========================================

  translateNotificationTitle(
    title: string
  ): string {

    const value = String(title || '').trim();

    switch (value.toLowerCase()) {

      case 'appointment cancelled':
        return 'تم إلغاء الموعد';

      case 'appointment booked successfully':
        return 'تم حجز الموعد بنجاح';

      default:
        return value;
    }
  }

  // ==========================================
  // Translate notification message
  // ==========================================

  translateNotificationMessage(
    message: string
  ): string {

    const value = String(message || '').trim();

    if (!value) {
      return '';
    }

    // ========================================
    // Appointment cancelled
    // ========================================

    const cancelledMatch = value.match(
      /^Your appointment with (.+?) on (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2}) has been cancelled\.?$/i
    );

    if (cancelledMatch) {

      const doctor = cancelledMatch[1].trim();
      const date = cancelledMatch[2];
      const time = cancelledMatch[3];

      return `تم إلغاء موعدك مع ${this.cleanDoctorName(
        doctor
      )} بتاريخ ${date} الساعة ${time}.`;
    }

    // ========================================
    // Appointment booked successfully
    // ========================================

    const bookedMatch = value.match(
      /^Your appointment with (.+?) has been booked for (\d{4}-\d{2}-\d{2}) at (\d{2}:\d{2})\.?$/i
    );

    if (bookedMatch) {

      const doctor = bookedMatch[1].trim();
      const date = bookedMatch[2];
      const time = bookedMatch[3];

      return `تم حجز موعدك مع ${this.cleanDoctorName(
        doctor
      )} بتاريخ ${date} الساعة ${time}.`;
    }

    // ========================================
    // Fallback
    // ========================================

    return value;
  }

  // ==========================================
  // Clean doctor name
  // ==========================================

  private cleanDoctorName(
    name: string
  ): string {

    let doctorName = String(name || '').trim();

    doctorName = doctorName.replace(
      /^(doctor|dr\.?|دكتور|د\.)\s*/i,
      ''
    );

    doctorName = doctorName.trim();

    return `د. ${doctorName}`;
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
          'فشل تحميل المواعيد';

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
        'هل أنت متأكد أنك تريد إلغاء هذا الموعد؟'
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
          'فشل إلغاء الموعد';

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