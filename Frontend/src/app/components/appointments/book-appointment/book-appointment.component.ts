import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

import { BookingStepsComponent } from '../booking-steps/booking-steps.component';


@Component({
  selector: 'app-book-appointment',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BookingStepsComponent,
  ],

  templateUrl: './book-appointment.component.html',
})
export class BookAppointmentComponent implements OnInit {

  private readonly doctorService = inject(DoctorService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly doctors = signal<Doctor[]>([]);

  readonly isLoading = signal(false);

  readonly errorMessage = signal('');

  readonly selectedDoctor = signal<Doctor | null>(null);

  readonly searchTerm = signal('');

  readonly selectedDepartment = signal(''); // '' = all departments

  // Tracks which doctor images failed to load, so we can fall back
  // to the emoji placeholder instead of showing a broken image.
  readonly failedImages = signal<Set<string>>(new Set());


  readonly departments = computed(() => {
    const names = this.doctors()
      .map((d) => this.departmentName(d))
      .filter((name) => name && name !== 'N/A');

    return Array.from(new Set(names)).sort();
  });


  readonly filteredDoctors = computed(() => {

    const term = this.searchTerm()
      .trim()
      .toLowerCase();

    const department = this.selectedDepartment();

    let list = this.doctors();

    if (department) {
      list = list.filter(
        (doctor) => this.departmentName(doctor) === department
      );
    }

    if (!term) {
      return list;
    }

    return list.filter((doctor) =>
      doctor.name.toLowerCase().includes(term) ||
      doctor.specialty.toLowerCase().includes(term)
    );
  });


  ngOnInit(): void {

    const preselectedId =
      this.route.snapshot.queryParamMap.get('doctorId');

    this.fetchDoctors(preselectedId);
  }


  fetchDoctors(preselectedId: string | null = null): void {

    this.isLoading.set(true);

    this.errorMessage.set('');

    this.doctorService.getDoctors().subscribe({

      next: (doctors) => {

        this.doctors.set(doctors);

        this.isLoading.set(false);


        if (preselectedId) {

          const doctor = doctors.find(
            (item) => item._id === preselectedId
          );

          if (doctor) {
            this.selectedDoctor.set(doctor);
            return;
          }

          this.doctorService
            .getDoctorById(preselectedId)
            .subscribe({

              next: (doctor) => {
                this.selectedDoctor.set(doctor);
              },

              error: () => {
                this.errorMessage.set(
                  'Doctor not found.'
                );
              },

            });
        }
      },

      error: (err) => {

        this.isLoading.set(false);

        this.errorMessage.set(
          err?.error?.message ||
          'Failed to load doctors. Please try again.'
        );
      },

    });
  }


  selectDoctor(doctor: Doctor): void {

    this.selectedDoctor.set(doctor);
  }


  changeDoctor(): void {

    this.selectedDoctor.set(null);

    this.router.navigate(
      ['/book-appointment']
    );
  }


  onBooked(appointmentId: string): void {

    this.router.navigate([
      '/appointments',
      appointmentId,
    ]);
  }


  onImageError(doctorId: string): void {
    const current = new Set(this.failedImages());
    current.add(doctorId);
    this.failedImages.set(current);
  }


  isArabicName(name: string): boolean {
    return /[\u0600-\u06FF]/.test(name || '');
  }


  departmentName(doctor: Doctor): string {
    const department = doctor?.department;

    if (department && typeof department === 'object') {
      return (department as any).name || 'N/A';
    }

    if (typeof department === 'string') {
      return department;
    }

    return 'N/A';
  }

}