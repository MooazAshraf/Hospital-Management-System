import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { UserServices } from '../../../services/users.service';
import { FooterComponent } from '../../shared/footer/footer.component';
import { NavbarComponent } from '../../shared/navbar/navbar.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-list.component.html',
})
export class PatientListComponent implements OnInit {
  patients: any[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditMode = false;
  errorMessage = '';

  patientForm: any = {
    _id: '',
    name: '',
    email: '',
    phone: '',
    gender: '',
    dateOfBirth: '',
    bloodGroup: '',
    password: '',
  };

  // ==========================
  // Staff (Doctor/Admin) Modal
  // ==========================
  showStaffModal = false;
  savingStaff = false;
  staffErrorMessage = '';

  staffForm: any = {
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'doctor',
  };

  constructor(
    private patientService: PatientService,
    private userServices: UserServices,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.errorMessage = '';

    const fetch$ = this.patientService.getAllPatients
      ? this.patientService.getAllPatients()
      : (this.patientService as any).getPatients();

    fetch$.subscribe({
      next: (response: any) => {
        if (Array.isArray(response)) {
          this.patients = response;
        } else if (response?.data && Array.isArray(response.data)) {
          this.patients = response.data;
        } else if (response?.patients && Array.isArray(response.patients)) {
          this.patients = response.patients;
        } else {
          this.patients = [];
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Error fetching patients:', error);
        this.errorMessage = error?.error?.message || 'فشل في جلب قائمة المرضى';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddPatientModal(): void {
    this.isEditMode = false;
    this.errorMessage = '';
    this.resetForm();
    this.showModal = true;
    this.cdr.detectChanges();
  }

  editPatient(patient: any): void {
    this.isEditMode = true;
    this.errorMessage = '';

    this.patientForm = {
      ...patient,
      dateOfBirth: patient?.dateOfBirth ? String(patient.dateOfBirth).substring(0, 10) : '',
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

  savePatient(): void {
    this.saving = true;
    this.errorMessage = '';

    const payload = { ...this.patientForm };

    if (this.isEditMode && payload._id) {
      const update$ = this.patientService.updatePatient
        ? this.patientService.updatePatient(payload._id, payload)
        : (this.patientService as any).updateProfile(payload._id, payload);

      update$.subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadPatients();
        },
        error: (err: any) => {
          console.error('Error updating patient:', err);
          this.errorMessage = err?.error?.message || 'فشل في تعديل بيانات المريض';
          this.saving = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      delete payload._id;

      const create$ = this.patientService.createPatient
        ? this.patientService.createPatient(payload)
        : (this.patientService as any).createProfile(payload);

      create$.subscribe({
        next: () => {
          this.saving = false;
          this.closeModal();
          this.loadPatients();
        },
        error: (err: any) => {
          console.error('Error adding patient:', err);
          this.errorMessage = err?.error?.message || 'فشل في إضافة المريض';
          this.saving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  deletePatient(id: string): void {
    if (!id) return;

    if (confirm('هل أنت متأكد من حذف هذا المريض؟')) {
      const delete$ = this.patientService.deletePatient
        ? this.patientService.deletePatient(id)
        : ((this.patientService as any).deleteProfile?.(id) ??
          (this.patientService as any).removePatient?.(id));

      if (!delete$) {
        alert('لا توجد طريقة حذف متاحة لهذا المريض');
        return;
      }

      delete$.subscribe({
        next: () => this.loadPatients(),
        error: (err: any) => {
          console.error('Error deleting patient:', err);
          alert(err?.error?.message || 'فشل في حذف المريض');
        },
      });
    }
  }

  private resetForm(): void {
    this.patientForm = {
      _id: '',
      name: '',
      email: '',
      phone: '',
      gender: '',
      dateOfBirth: '',
      bloodGroup: '',
      password: '',
    };
  }

  // ==========================
  // Staff (Doctor/Admin) Methods
  // ==========================
  openAddStaffModal(): void {
    this.staffErrorMessage = '';
    this.resetStaffForm();
    this.showStaffModal = true;
    this.cdr.detectChanges();
  }

  closeStaffModal(): void {
    this.showStaffModal = false;
    this.staffErrorMessage = '';
    this.resetStaffForm();
    this.cdr.detectChanges();
  }

  saveStaff(): void {
    this.savingStaff = true;
    this.staffErrorMessage = '';

    this.userServices.addStaff({ ...this.staffForm }).subscribe({
      next: () => {
        this.savingStaff = false;
        this.closeStaffModal();
      },
      error: (err: any) => {
        console.error('Error adding staff account:', err);
        this.staffErrorMessage = err?.error?.message || 'فشل في إضافة الحساب';
        this.savingStaff = false;
        this.cdr.detectChanges();
      },
    });
  }

  private resetStaffForm(): void {
    this.staffForm = {
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'doctor',
    };
  }
}
