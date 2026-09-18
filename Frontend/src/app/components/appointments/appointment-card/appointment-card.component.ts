import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment } from '../../../models/appointment.model';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-card.component.html',
})
export class AppointmentCardComponent {
  @Input({ required: true }) appointment!: Appointment;

  // Pass true only for the patient's own list — a doctor/admin list should hide this.
  @Input() canCancel = false;

  // Parent (the appointments list page) owns the actual API call, so it can
  // remove/refresh the item and show its own success/error state.
  @Output() cancelRequested = new EventEmitter<string>();

  readonly cancelling = signal(false);

  get doctorLabel(): string {
    const doctor = this.appointment.doctor;
    if (typeof doctor === 'string') return 'الطبيب';
    return doctor.user?.name ?? 'الطبيب';
  }
  get appointmentTypeLabel(): string {
  const map: Record<string, string> = {
    'Consultation': 'استشارة',
    'Follow-up': 'متابعة',
    'Check-up': 'كشف جديد',
  };

  return (
    map[this.appointment.appointmentType] ??
    this.appointment.appointmentType
  );
}

  get patientLabel(): string {
    const patient = this.appointment.patient;
    if (typeof patient === 'string') return 'المريض';
    return patient.user?.name ?? 'المريض';
  }

  get statusLabel(): string {
    const map: Record<string, string> = {
      Pending: 'قيد الانتظار',
      Confirmed: 'مؤكد',
      Completed: 'مكتمل',
      Cancelled: 'ملغي',
    };
    return map[this.appointment.status] ?? this.appointment.status;
  }

  onCancel(): void {
    this.cancelRequested.emit(this.appointment._id);
  }
}