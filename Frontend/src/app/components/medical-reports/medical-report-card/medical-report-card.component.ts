import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalReport } from '../medical-report.model';

@Component({
  selector: 'app-medical-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-report-card.component.html'
})
export class MedicalReportCardComponent {
  @Input() report!: MedicalReport;

  // Resolved display names (passed in by the parent, since the backend
  // only stores raw ObjectIds for patient/doctor/medicines).
  @Input() patientName = 'Unknown patient';
  @Input() doctorName = 'Unknown doctor';
  @Input() medicineNames: Record<string, string> = {};

  // Set to true by pages (e.g. an admin/doctor report list) that allow
  // editing; left false when the card is just used for display.
  @Input() showActions = false;

  @Output() edit = new EventEmitter<MedicalReport>();
  @Output() remove = new EventEmitter<MedicalReport>();

  medicineName(value: any): string {
    if (value && typeof value === 'object') return value.name || 'Unknown medicine';
    return this.medicineNames[String(value)] || 'Unknown medicine';
  }

  onEdit(): void {
    this.edit.emit(this.report);
  }

  onRemove(): void {
    this.remove.emit(this.report);
  }
}
