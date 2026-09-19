import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
<<<<<<< HEAD
=======
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
import { Doctor } from '../../../models/doctor.model';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
<<<<<<< HEAD
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-card.component.html',
=======

  imports: [
    CommonModule,
    RouterLink,
    ImagePathPipe,
  ],

  templateUrl:
    './doctor-card.component.html',
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
})
export class DoctorCardComponent {
  @Input() doctor!: Doctor;

  imageFailed = false;

  get departmentName(): string {
    const department = this.doctor?.department;

    if (department && typeof department === 'object') {
      return department.name || 'N/A';
    }

    if (typeof department === 'string') {
      return department;
    }

    return 'N/A';
  }

  get isArabicName(): boolean {
    return /[\u0600-\u06FF]/.test(this.doctor?.name || '');
  }
}