import { DepartmentsService } from './../../../services/department.service';
import { Component, ChangeDetectorRef, inject, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import { DoctorCardComponent } from '../../doctors/doctor-card/doctor-card.component';


import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

import { Department } from '../../../models';

@Component({
  selector: 'app-department-details',
  standalone: true,
  imports: [CommonModule, DoctorCardComponent, ImagePathPipe],
  templateUrl: './department-details.component.html',
})
export class DepartmentDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly departmentService = inject(DepartmentsService);
  private readonly doctorService = inject(DoctorService);
  private readonly cdr = inject(ChangeDetectorRef);

  department: Department | null = null;
  doctors: Doctor[] = [];

  loading = true;
  errorMessage = '';
  doctorsErrorMessage = '';

  ngOnInit(): void {
    this.loadDepartmentPage();
  }

  private loadDepartmentPage(): void {
    this.loading = true;
    this.errorMessage = '';
    this.doctorsErrorMessage = '';

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const departmentId = params.get('id');

          if (!departmentId) {
            throw new Error('Department ID not found');
          }

          return forkJoin({
            department: this.departmentService.getById(departmentId),

            doctors: this.doctorService.getDoctors().pipe(
              catchError((error) => {
                console.error('Doctors API error:', error);

                this.doctorsErrorMessage = 'Could not load doctors right now.';

                return of([] as Doctor[]);
              }),
            ),
          });
        }),

        catchError((error) => {
          console.error('Department page error:', error);

          this.errorMessage = error?.error?.message || 'Could not load department information.';

          this.department = null;
          this.doctors = [];

          this.loading = false;
          this.cdr.detectChanges();

          return of(null);
        }),
        
      )
      .subscribe((result) => {
        if (!result) {
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        this.department = result.department ?? null;

        if (!this.department) {
          this.errorMessage = 'Department not found.';
          this.loading = false;
          this.cdr.detectChanges();
          return;
        }

        const departmentId = this.department._id;

        this.doctors = result.doctors.filter((doctor) => {
          if (!doctor.department) {
            return false;
          }

          if (typeof doctor.department === 'string') {
            return doctor.department === departmentId;
          }

          return doctor.department._id === departmentId;
        });

        console.log('Department:', this.department);
        console.log('Department doctors:', this.doctors);

        this.loading = false;
        this.cdr.detectChanges();
      });
  }
}
