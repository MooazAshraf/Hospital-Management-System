import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { AuthService } from '../../../services/auth.service';
import { PatientService } from '../../../services/patient.service';
import { Iuser } from '../../../models/users.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user: Iuser | null = null;

  patient: any = null;
  hasPatient = false;

  loadingProfile = true;
  editMode = false;
  savingProfile = false;

  editableName = '';
  editableEmail = '';
  editablePhone = '';
  editableGender = '';
  editableDateOfBirth = '';
  editableBloodGroup = '';
  editableStreet = '';
  editableCity = '';
  editableEmergencyName = '';
  editableEmergencyPhone = '';
  editableEmergencyRelationship = '';

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
  ) {
    this.user = this.authService.getUser();
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loadingProfile = true;

    this.patientService.getMyProfile().subscribe({
      next: (response) => {
        console.log('استجابة GET /api/patients/me:', response);

        const normalizedPatient =
          this.normalizePatientResponse(response);

        this.patient = normalizedPatient;
        this.hasPatient =
          this.checkHasPatient(normalizedPatient);

        if (normalizedPatient) {
          this.fillEditableFields(normalizedPatient);
        }

        this.loadingProfile = false;
        this.cdr.detectChanges();

        console.log('بيانات المريض بعد المعالجة:', this.patient);
        console.log('هل يوجد ملف مريض:', this.hasPatient);
      },

      error: (error) => {
        console.error(
          'فشل طلب GET /api/patients/me:',
          error
        );

        this.patient = null;
        this.hasPatient = false;

        this.loadingProfile = false;
        this.cdr.detectChanges();
      },
    });
  }

  private normalizePatientResponse(response: any): any | null {
    if (!response) {
      return null;
    }

    // { patient: {...} }
    if (response.patient) {
      return response.patient;
    }

    // { data: { patient: {...} } }
    if (response.data?.patient) {
      return response.data.patient;
    }

    // { data: {...} }
    if (response.data) {
      return response.data;
    }

    // كائن المريض مباشرة
    if (
      response._id ||
      response.name ||
      response.email ||
      response.phone
    ) {
      return response;
    }

    return null;
  }

  private checkHasPatient(patient: any): boolean {
    return !!(
      patient &&
      (
        patient._id ||
        patient.name ||
        patient.email ||
        patient.phone
      )
    );
  }

  private fillEditableFields(patient: any): void {
    this.editableName =
      patient?.name ?? this.user?.name ?? '';

    this.editableEmail =
      patient?.email ?? this.user?.email ?? '';

    this.editablePhone =
      patient?.phone ?? this.user?.phone ?? '';

    this.editableGender =
      patient?.gender ?? '';

    this.editableDateOfBirth =
      patient?.dateOfBirth
        ? String(patient.dateOfBirth).substring(0, 10)
        : '';

    this.editableBloodGroup =
      patient?.bloodGroup ?? '';

    this.editableStreet =
      patient?.address?.street ?? '';

    this.editableCity =
      patient?.address?.city ?? '';

    this.editableEmergencyName =
      patient?.emergencyContact?.name ?? '';

    this.editableEmergencyPhone =
      patient?.emergencyContact?.phone ?? '';

    this.editableEmergencyRelationship =
      patient?.emergencyContact?.relationship ?? '';
  }

  toggleEdit(): void {
    if (this.editMode) {
      this.editMode = false;
      this.fillEditableFields(this.patient);
      return;
    }

    this.editMode = true;
    this.fillEditableFields(this.patient);

    this.patientService.getMyProfile().subscribe({
      next: (response) => {
        console.log(
          'أحدث بيانات للمريض قبل التعديل:',
          response
        );

        const latestPatient =
          this.normalizePatientResponse(response);

        if (latestPatient) {
          this.patient = latestPatient;
          this.hasPatient =
            this.checkHasPatient(latestPatient);

          this.fillEditableFields(latestPatient);
        }

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.warn(
          'تعذر تحديث بيانات المريض قبل التعديل:',
          error
        );

        this.fillEditableFields(this.patient);
        this.cdr.detectChanges();
      },
    });
  }

  saveProfile(): void {
    const payload = {
      name: this.editableName,
      email: this.editableEmail,
      phone: this.editablePhone,
      gender: this.editableGender,
      dateOfBirth: this.editableDateOfBirth,
      bloodGroup: this.editableBloodGroup,

      address: {
        street: this.editableStreet,
        city: this.editableCity,
      },

      emergencyContact: {
        name: this.editableEmergencyName,
        phone: this.editableEmergencyPhone,
        relationship: this.editableEmergencyRelationship,
      },
    };

    this.savingProfile = true;

    this.patientService.saveMyProfile(payload).subscribe({
      next: (response) => {
        console.log(
          'استجابة حفظ الملف الشخصي:',
          response
        );

        const updatedPatient =
          this.normalizePatientResponse(response);

        if (updatedPatient) {
          this.patient = updatedPatient;
          this.hasPatient =
            this.checkHasPatient(updatedPatient);
        }

        const currentUser =
          this.authService.getUser();

        if (currentUser) {
          this.authService.login(
            this.authService.getToken() || '',
            {
              ...currentUser,
              name: this.editableName,
              email: this.editableEmail,
              phone: this.editablePhone,
            }
          );
        }

        this.editMode = false;
        this.savingProfile = false;

        this.cdr.detectChanges();
      },

      error: (error) => {
        console.error(
          'فشل حفظ الملف الشخصي:',
          error
        );

        this.savingProfile = false;
        this.cdr.detectChanges();
      },
    });
  }
}