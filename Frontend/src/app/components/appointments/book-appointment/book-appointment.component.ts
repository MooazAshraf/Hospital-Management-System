import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

import { BookingStepsComponent } from '../booking-steps/booking-steps.component';


@Component({
  selector: 'app-book-appointment',
  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
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


  readonly filteredDoctors = computed(() => {

    const term = this.searchTerm()
      .trim()
      .toLowerCase();

    const list = this.doctors();

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

    this.router.navigate(['/patient-dashboard']);
  }

}