import {
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MedicalReport } from '../medical-report.model';

@Component({
  selector: 'app-medical-report-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-report-card.component.html',
})
export class MedicalReportCardComponent {
  @Input() report: MedicalReport | null = null;

  @Input() patientName = 'مريض غير معروف';

  @Input() doctorName = 'طبيب غير معروف';

  @Input() medicineNames: Record<string, string> = {};

  @Input() showActions = false;

  @Output() edit = new EventEmitter<MedicalReport>();

  @Output() remove = new EventEmitter<MedicalReport>();

  medicineName(value: any): string {
    if (
      value &&
      typeof value === 'object'
    ) {
      return (
        value.name ||
        'دواء غير معروف'
      );
    }

    return (
      this.medicineNames[String(value)] ||
      'دواء غير معروف'
    );
  }

  onEdit(): void {
    if (!this.report) {
      return;
    }

    this.edit.emit(this.report);
  }

  onRemove(): void {
    if (!this.report) {
      return;
    }

    this.remove.emit(this.report);
  }
}