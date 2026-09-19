import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.component.html',
})
export class DoctorDashboardComponent implements OnInit {
  private readonly appointmentService =
    inject(AppointmentService);

  appointments: Appointment[] = [];
  loading = false;
  errorMessage = '';

  get today(): string {
    const d = new Date();

    return `${d.getFullYear()}-${String(
      d.getMonth() + 1
    ).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }

  get todayAppointments(): Appointment[] {
    return this.appointments.filter(
      (a) => a.date === this.today
    );
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;

    this.appointmentService.getAll().subscribe({
      next: (res) => {
        this.appointments = res.data || [];
        this.loading = false;
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'فشل تحميل المواعيد';

        this.loading = false;
      },
    });
  }

  patientName(a: Appointment): string {
    if (typeof a.patient === 'object') {
      return (
        a.patient.user?.name ||
        'المريض'
      );
    }

    return 'المريض';
  }

  setStatus(
    a: Appointment,
    status:
      | 'Confirmed'
      | 'Completed'
      | 'Cancelled'
  ): void {
    this.appointmentService
      .update(a._id, { status })
      .subscribe({
        next: () => this.load(),

        error: (err) =>
          (this.errorMessage =
            err?.error?.message ||
            'فشل تحديث حالة الموعد'),
      });
  }
}