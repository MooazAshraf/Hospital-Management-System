import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DoctorCardComponent],
  templateUrl: './doctors-list.component.html',
})
export class DoctorsListComponent implements OnInit {
  private readonly doctorService = inject(DoctorService);

  readonly doctors = signal<Doctor[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly searchTerm = signal('');
  readonly selectedDepartment = signal(''); // '' = all departments

  private departmentNameOf(doctor: Doctor): string {
    const dept = doctor.department;
    return dept && typeof dept === 'object' ? dept.name || '' : (dept as string) || '';
  }

  // Unique department names pulled straight from the loaded doctors list
  readonly departments = computed(() => {
    const names = this.doctors().map((d) => this.departmentNameOf(d)).filter(Boolean);
    return Array.from(new Set(names)).sort();
  });

  readonly filteredDoctors = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const department = this.selectedDepartment();
    let list = this.doctors();

    if (department) {
      list = list.filter((doctor) => this.departmentNameOf(doctor) === department);
    }

    if (term) {
      list = list.filter((doctor) => {
        const departmentName = this.departmentNameOf(doctor).toLowerCase();
        return (
          doctor.name.toLowerCase().includes(term) ||
          departmentName.includes(term)
        );
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.fetchDoctors();
  }

  fetchDoctors(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors.set(doctors);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set(
          err?.error?.message || 'Failed to load doctors. Please try again.'
        );
        this.isLoading.set(false);
      },
    });
  }
}