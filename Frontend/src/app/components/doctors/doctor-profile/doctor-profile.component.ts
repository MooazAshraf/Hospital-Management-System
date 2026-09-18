import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-profile.component.html',
})
export class DoctorProfileComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly doctorService = inject(DoctorService);

  readonly doctor = signal<Doctor | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  get departmentName(): string {
    const dept = this.doctor()?.department;
    return dept && typeof dept === 'object' ? dept.name : 'N/A';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.errorMessage.set('Doctor not found.');
      return;
    }

    this.isLoading.set(true);

    this.doctorService.getDoctorById(id).subscribe({
      next: (doctor) => {
        this.doctor.set(doctor);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'Could not load this doctor. Please try again.'
        );
        this.isLoading.set(false);
      },
    });
  }
}