import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointment-card.component.html',
})
export class AppointmentCardComponent {

  @Input() appointment: any = null;

  @Output() cancel = new EventEmitter<string>();


  // =====================================================
  // Doctor Name
  // =====================================================

  get doctorName(): string {
    const doctor = this.appointment?.doctor;

    if (!doctor) {
      return 'الطبيب';
    }

    let name = '';

    if (typeof doctor === 'object') {
      name =
        doctor.name ||
        doctor.fullName ||
        doctor.user?.name ||
        doctor.user?.fullName ||
        '';
    } else if (typeof doctor === 'string') {
      name = doctor;
    }

    return this.cleanDoctorName(name);
  }


  // =====================================================
  // Clean Doctor Name
  // =====================================================

  private cleanDoctorName(name: string): string {

    if (!name) {
      return 'الطبيب';
    }

    let cleanName = String(name).trim();

    // إزالة ألقاب الطبيب
    cleanName = cleanName.replace(
      /^(doctor|dr\.?|دكتور|د\.?)\s*/i,
      ''
    );

    cleanName = cleanName.trim();

    if (!cleanName) {
      return 'الطبيب';
    }

    // الاسم العربي
    if (/[\u0600-\u06FF]/.test(cleanName)) {
      return `د. ${cleanName}`;
    }

    // الاسم الإنجليزي
    return `Dr. ${cleanName}`;
  }


  // =====================================================
  // Date
  // =====================================================

  get formattedDate(): string {

    const date = this.appointment?.date;

    if (!date) {
      return '';
    }

    const parsed = new Date(`${date}T00:00:00`);

    if (isNaN(parsed.getTime())) {
      return date;
    }

    return new Intl.DateTimeFormat(
      'ar-EG',
      {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }
    ).format(parsed);
  }


  // =====================================================
  // Time
  // =====================================================

  get formattedTime(): string {
    return this.appointment?.time || '';
  }


  // =====================================================
  // Appointment Type
  // =====================================================

  get appointmentType(): string {

    const type = this.appointment?.appointmentType;

    switch (type) {

      case 'Consultation':
        return 'استشارة';

      case 'Follow-up':
        return 'متابعة';

      case 'Check-up':
        return 'فحص';

      default:
        return type || '';
    }
  }


  // =====================================================
  // Status
  // =====================================================

  get statusLabel(): string {

    switch (this.appointment?.status) {

      case 'Pending':
        return 'قيد الانتظار';

      case 'Confirmed':
        return 'مؤكد';

      case 'Completed':
        return 'مكتمل';

      case 'Cancelled':
        return 'ملغي';

      default:
        return this.appointment?.status || '';
    }
  }


  // =====================================================
  // Status Class
  // =====================================================

  get statusClass(): string {

    switch (this.appointment?.status) {

      case 'Confirmed':
        return 'bg-emerald-50 text-emerald-700';

      case 'Pending':
        return 'bg-emerald-50 text-emerald-700';

      case 'Completed':
        return 'bg-gray-100 text-gray-600';

      case 'Cancelled':
        return 'bg-red-50 text-red-600';

      default:
        return 'bg-gray-100 text-gray-600';
    }
  }


  // =====================================================
  // Queue Number
  // =====================================================

  get queueNumber(): string {

    if (
      this.appointment?.queueNumber === undefined ||
      this.appointment?.queueNumber === null
    ) {
      return '';
    }

    return `رقم الانتظار: ${this.appointment.queueNumber}`;
  }


  // =====================================================
  // Cancel
  // =====================================================

  cancelAppointment(): void {

    const id =
      this.appointment?._id ||
      this.appointment?.id;

    if (!id) {
      return;
    }

    this.cancel.emit(id);
  }
}