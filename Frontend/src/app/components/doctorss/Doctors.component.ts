import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DoctorService } from '../../services/doctor.service';
import { Doctor } from '../../models/doctor.model';

import { DoctorCardComponent } from '../doctors/doctor-card/doctor-card.component';

@Component({
  selector: 'app-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DoctorCardComponent,
  ],
  templateUrl: './Doctors.component.html',
})
export class DoctorsComponent implements OnInit {

  private readonly doctorService = inject(DoctorService);

  readonly doctors = signal<Doctor[]>([]);

  readonly isLoading = signal(false);

  readonly errorMessage = signal('');

  readonly searchTerm = signal('');

  readonly selectedDepartment = signal('');


  // Get departments from doctors
  readonly departments = computed(() => {

    const names = this.doctors()
      .map((doctor) => {

        const department = doctor.department;

        if (
          department &&
          typeof department === 'object'
        ) {
          return department.name || '';
        }

        if (typeof department === 'string') {
          return department;
        }

        return '';
      })
      .filter((name) => !!name);

    return [...new Set(names)].sort();
  });


  // Search + Department Filter
  readonly filteredDoctors = computed(() => {

    const doctors = this.doctors();

    const search =
      this.searchTerm()
        .trim()
        .toLowerCase();

    const selectedDepartment =
      this.selectedDepartment()
        .trim()
        .toLowerCase();


    return doctors.filter((doctor) => {

      const department =
        doctor.department &&
        typeof doctor.department === 'object'
          ? doctor.department.name || ''
          : typeof doctor.department === 'string'
            ? doctor.department
            : '';


      const doctorName =
        (doctor.name || '').toLowerCase();

      const departmentName =
        department.toLowerCase();


      // Search by doctor name OR department
      const matchesSearch =
        !search ||
        doctorName.includes(search) ||
        departmentName.includes(search);


      // Selected department
      const matchesDepartment =
        !selectedDepartment ||
        departmentName === selectedDepartment;


      return (
        matchesSearch &&
        matchesDepartment
      );
    });
  });


  ngOnInit(): void {
    this.getDoctors();
  }


  getDoctors(): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.doctorService.getDoctors().subscribe({

      next: (doctors: Doctor[]) => {

        this.doctors.set(doctors);

        this.isLoading.set(false);
      },


      error: (error: any) => {

        console.error(
          'Error loading doctors:',
          error
        );

        this.errorMessage.set(
          error?.error?.message ||
          'Failed to load doctors. Please try again.'
        );

        this.isLoading.set(false);
      },

    });
  }


  clearFilters(): void {

    this.searchTerm.set('');

    this.selectedDepartment.set('');
  }

}