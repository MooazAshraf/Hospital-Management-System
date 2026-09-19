import {
  Component,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DoctorService } from '../../../services/doctor.service';

@Component({
  selector: 'app-admin-doctors',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './admin-doctors.component.html',
})
export class AdminDoctorsComponent implements OnInit {
  doctors: any[] = [];

  loading = false;
  saving = false;

  showModal = false;
  isEditMode = false;

  errorMessage = '';

  doctorForm: any = {
    _id: '',
    user: '',
    name: '',
    specialty: '',
    department: '',
    email: '',
    phone: '',
    description: '',
    fees: '',
    qualifications: '',
    roomNumber: '',
    experienceYears: '',
    isAvailable: true,
    image: '',
    password: '',
  };

  constructor(
    private doctorService: DoctorService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.loading = true;
    this.errorMessage = '';

    this.doctorService.getDoctors().subscribe({
      next: (doctors) => {
        this.doctors = doctors || [];
        this.loading = false;

        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Error fetching doctors:',
          err
        );

        this.errorMessage =
          err?.error?.message ||
          'فشل تحميل الأطباء. يرجى المحاولة مرة أخرى.';

        this.loading = false;

        this.cdr.detectChanges();
      },
    });
  }

  openAddDoctorModal(): void {
    this.isEditMode = false;
    this.errorMessage = '';

    this.resetForm();

    this.showModal = true;

    this.cdr.detectChanges();
  }

  editDoctor(doctor: any): void {
    this.isEditMode = true;
    this.errorMessage = '';

    this.doctorForm = {
      ...doctor,

      user:
        typeof doctor.user === 'object'
          ? doctor.user?._id || ''
          : doctor.user || '',

      department:
        typeof doctor.department === 'object'
          ? doctor.department?._id || ''
          : doctor.department || '',

      password: '',
    };

    this.showModal = true;

    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';

    this.resetForm();

    this.cdr.detectChanges();
  }

  saveDoctor(): void {
    if (this.saving) {
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const payload = {
      ...this.doctorForm,
    };

    if (this.isEditMode && payload._id) {
      this.doctorService
        .updateDoctor(
          payload._id,
          payload
        )
        .subscribe({
          next: () => {
            this.saving = false;

            this.closeModal();
            this.loadDoctors();
          },

          error: (err) => {
            console.error(
              'Error updating doctor:',
              err
            );

            this.errorMessage =
              err?.error?.message ||
              'فشل تحديث بيانات الطبيب.';

            this.saving = false;

            this.cdr.detectChanges();
          },
        });
    } else {
      delete payload._id;

      this.doctorService
        .createDoctor(payload)
        .subscribe({
          next: () => {
            this.saving = false;

            this.closeModal();
            this.loadDoctors();
          },

          error: (err) => {
            console.error(
              'Error creating doctor:',
              err
            );

            this.errorMessage =
              err?.error?.message ||
              'فشل إضافة الطبيب.';

            this.saving = false;

            this.cdr.detectChanges();
          },
        });
    }
  }

  deleteDoctor(id: string): void {
    if (!id) {
      return;
    }

    if (
      !confirm(
        'هل أنت متأكد أنك تريد حذف هذا الطبيب؟'
      )
    ) {
      return;
    }

    this.doctorService
      .deleteDoctor(id)
      .subscribe({
        next: () => {
          this.loadDoctors();
        },

        error: (err) => {
          console.error(
            'Error deleting doctor:',
            err
          );

          alert(
            err?.error?.message ||
            'فشل حذف الطبيب.'
          );
        },
      });
  }

  departmentName(doctor: any): string {
    const department =
      doctor?.department;

    if (
      department &&
      typeof department === 'object'
    ) {
      return department.name || 'غير محدد';
    }

    return department || 'غير محدد';
  }

  doctorEmail(doctor: any): string {
    return (
      doctor?.email ||
      doctor?.user?.email ||
      'غير محدد'
    );
  }

  private resetForm(): void {
    this.doctorForm = {
      _id: '',
      user: '',
      name: '',
      specialty: '',
      department: '',
      email: '',
      phone: '',
      description: '',
      fees: '',
      qualifications: '',
      roomNumber: '',
      experienceYears: '',
      isAvailable: true,
      image: '',
      password: '',
    };
  }
}