import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from '../../../models/appointment.model';

import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-appointments.component.html',
})
export class AdminAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];

  loading = false;
  saving = false;

  showModal = false;
  isEditMode = false;

  errorMessage = '';

  appointmentForm: any = {
    _id: '',
    date: '',
    time: '',
    appointmentType: 'Consultation',
    notes: '',
    status: 'Pending',
  };

  appointmentTypes: AppointmentType[] = [
    'Consultation',
    'Follow-up',
    'Check-up',
  ];

  appointmentStatuses: AppointmentStatus[] = [
    'Pending',
    'Confirmed',
    'Completed',
    'Cancelled',
  ];

  constructor(
    private appointmentService: AppointmentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentService.getAll().subscribe({
      next: (response) => {
        this.appointments = response.data || [];
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Error fetching appointments:', err);

        this.errorMessage =
          err?.error?.message ||
          'فشل تحميل المواعيد. يرجى المحاولة مرة أخرى.';

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  editAppointment(appointment: Appointment): void {
    this.isEditMode = true;
    this.errorMessage = '';

    this.appointmentForm = {
      _id: appointment._id,
      date: appointment.date,
      time: appointment.time,
      appointmentType: appointment.appointmentType,
      notes: appointment.notes || '',
      status: appointment.status,
    };

    this.showModal = true;

    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';

    this.resetForm();

    this.cdr.detectChanges();
  }

  saveAppointment(): void {
    if (!this.appointmentForm._id) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      date: this.appointmentForm.date,
      time: this.appointmentForm.time,
      appointmentType: this.appointmentForm.appointmentType,
      notes: this.appointmentForm.notes,
      status: this.appointmentForm.status,
    };

    this.appointmentService
      .update(this.appointmentForm._id, payload)
      .subscribe({
        next: () => {
          this.saving = false;

          this.closeModal();
          this.loadAppointments();
        },

        error: (err) => {
          console.error('Error updating appointment:', err);

          this.errorMessage =
            err?.error?.message ||
            'فشل تحديث الموعد.';

          this.saving = false;

          this.cdr.detectChanges();
        },
      });
  }

  deleteAppointment(id: string): void {
    if (!id) return;

    if (
      !confirm(
        'هل أنت متأكد من حذف هذا الموعد؟'
      )
    ) {
      return;
    }

    this.appointmentService.delete(id).subscribe({
      next: () => {
        this.loadAppointments();
      },

      error: (err) => {
        console.error(
          'Error deleting appointment:',
          err
        );

        alert(
          err?.error?.message ||
            'فشل حذف الموعد.'
        );
      },
    });
  }

  getPatientName(appointment: Appointment): string {
    if (
      typeof appointment.patient === 'object' &&
      appointment.patient?.user
    ) {
      return appointment.patient.user.name || 'مريض غير معروف';
    }

    return 'مريض غير معروف';
  }

  getDoctorName(appointment: Appointment): string {
    if (
      typeof appointment.doctor === 'object'
    ) {
      return appointment.doctor.name || 'طبيب غير معروف';
    }

    return 'طبيب غير معروف';
  }

  getAppointmentTypeLabel(type: AppointmentType | string): string {
    switch (type) {
      case 'Consultation':
        return 'استشارة';

      case 'Follow-up':
        return 'متابعة';

      case 'Check-up':
        return 'كشف';

      default:
        return type || '';
    }
  }

  getStatusLabel(status: AppointmentStatus | string): string {
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار';

      case 'Confirmed':
        return 'مؤكد';

      case 'Completed':
        return 'مكتمل';

      case 'Cancelled':
        return 'ملغي';

      default:
        return status || '';
    }
  }

  private resetForm(): void {
    this.appointmentForm = {
      _id: '',
      date: '',
      time: '',
      appointmentType: 'Consultation',
      notes: '',
      status: 'Pending',
    };
  }
}