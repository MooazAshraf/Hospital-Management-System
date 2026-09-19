import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { MedicalReportCardComponent } from '../medical-report-card/medical-report-card.component';
import {
  MedicalReportService,
  SimpleUser,
} from '../services/medical-report.service';

import { MedicineService } from '../../medicine/services/medicine.service';
import { Medicine } from '../../medicine/medicine.model';
import { AuthService } from '../../../services/auth.service';
import {
  emptyReport,
  MedicalReport,
} from '../medical-report.model';

@Component({
  selector: 'app-medical-reports-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MedicalReportCardComponent,
  ],
  templateUrl: './medical-reports-list.component.html',
})
export class MedicalReportsListComponent implements OnInit {

  reports: MedicalReport[] = [];
  filteredReports: MedicalReport[] = [];

  needsLogin = false;
  canManage = false;

  patients: SimpleUser[] = [];
  doctors: SimpleUser[] = [];
  medicines: Medicine[] = [];

  usersById: Record<string, string> = {};
  medicineNamesById: Record<string, string> = {};

  reportTypes: string[] = [];

  loading = false;
  errorMessage = '';

  searchTerm = '';
  typeFilter = '';

  showModal = false;
  isEditMode = false;
  editingId: string | null = null;
  saving = false;
  formError = '';

  deleteTarget: MedicalReport | null = null;
  deleting = false;

  form: FormGroup;

  constructor(
    private reportService: MedicalReportService,
    private medicineService: MedicineService,
    private authService: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      patient: ['', Validators.required],
      doctor: ['', Validators.required],
      reportType: ['', Validators.required],
      title: ['', Validators.required],
      diagnosis: ['', Validators.required],
      findings: [''],
      recommendations: [''],
      reportDate: ['', Validators.required],
      prescribedMedicines: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.canManage =
      this.authService.hasRole('doctor', 'admin');

    this.loadAll();
  }

  get f() {
    return this.form.controls;
  }

  get prescribedMedicines(): FormArray {
    return this.form.get(
      'prescribedMedicines'
    ) as FormArray;
  }

  loadAll(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      reports: this.reportService.getReports().pipe(
        catchError((error) => {
          if (error?.status === 401) {
            this.needsLogin = true;
          } else {
            this.errorMessage =
              error?.error?.message ||
              'فشل تحميل التقارير الطبية.';
          }

          return of([] as MedicalReport[]);
        })
      ),

      users: this.reportService.getUsers().pipe(
        catchError((error) => {
          if (error?.status === 401) {
            this.needsLogin = true;
          }

          return of({
            message: '',
            users: [] as SimpleUser[],
          });
        })
      ),

      medicines: this.medicineService
        .getMedicines()
        .pipe(
          catchError(() =>
            of([] as Medicine[])
          )
        ),
    }).subscribe(
      ({
        reports,
        users,
        medicines,
      }) => {

        this.reports = reports || [];

        const allUsers =
          users?.users || [];

        this.patients =
          allUsers.filter(
            (u) => u.role === 'user'
          );

        this.doctors =
          allUsers.filter(
            (u) => u.role === 'doctor'
          );

        this.usersById = {};

        allUsers.forEach(
          (u) =>
            (this.usersById[u._id] = u.name)
        );

        this.medicines =
          medicines || [];

        this.medicineNamesById = {};

        this.medicines.forEach((m) => {
          if (m._id) {
            this.medicineNamesById[m._id] =
              m.name;
          }
        });

        this.reportTypes =
          Array.from(
            new Set(
              this.reports
                .map(
                  (r) => r.reportType
                )
                .filter(Boolean)
            )
          ).sort();

        this.applyFilters();

        this.loading = false;

        this.cdr.detectChanges();
      }
    );
  }

  patientName(value: any): string {
    if (
      value &&
      typeof value === 'object'
    ) {
      return (
        value.name ||
        'مريض غير معروف'
      );
    }

    return (
      this.usersById[String(value)] ||
      'مريض غير معروف'
    );
  }

  doctorName(value: any): string {
    if (
      value &&
      typeof value === 'object'
    ) {
      return (
        value.name ||
        'طبيب غير معروف'
      );
    }

    return (
      this.usersById[String(value)] ||
      'طبيب غير معروف'
    );
  }

  applyFilters(): void {
    const term =
      this.searchTerm
        .trim()
        .toLowerCase();

    this.filteredReports =
      this.reports.filter((r) => {

        const matchesSearch =
          !term ||
          r.title
            ?.toLowerCase()
            .includes(term) ||
          r.diagnosis
            ?.toLowerCase()
            .includes(term) ||
          this.patientName(
            r.patient
          )
            .toLowerCase()
            .includes(term) ||
          this.doctorName(
            r.doctor
          )
            .toLowerCase()
            .includes(term);

        const matchesType =
          !this.typeFilter ||
          r.reportType ===
            this.typeFilter;

        return (
          matchesSearch &&
          matchesType
        );
      });
  }

  onSearchChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onTypeChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  addMedicineRow(): void {
    this.prescribedMedicines.push(
      this.fb.group({
        medicine: [
          '',
          Validators.required,
        ],
        dosage: [
          '',
          Validators.required,
        ],
        frequency: [
          '',
          Validators.required,
        ],
        duration: [
          '',
          Validators.required,
        ],
      })
    );
  }

  removeMedicineRow(
    index: number
  ): void {
    this.prescribedMedicines.removeAt(
      index
    );
  }

  openAddModal(): void {
    if (!this.canManage) {
      return;
    }

    this.isEditMode = false;
    this.editingId = null;
    this.formError = '';

    this.prescribedMedicines.clear();

    this.form.reset(
      emptyReport()
    );

    this.showModal = true;
  }

  openEditModal(
    report: MedicalReport
  ): void {

    if (!this.canManage) {
      return;
    }

    this.isEditMode = true;
    this.editingId =
      report._id ?? null;

    this.formError = '';

    this.prescribedMedicines.clear();

    (
      report.prescribedMedicines ||
      []
    ).forEach((pm) => {

      this.prescribedMedicines.push(
        this.fb.group({
          medicine: [
            typeof pm.medicine ===
            'object'
              ? (pm.medicine as any)._id
              : pm.medicine,
            Validators.required,
          ],

          dosage: [
            pm.dosage,
            Validators.required,
          ],

          frequency: [
            pm.frequency,
            Validators.required,
          ],

          duration: [
            pm.duration,
            Validators.required,
          ],
        })
      );
    });

    this.form.patchValue({
      patient:
        typeof report.patient ===
        'object'
          ? (report.patient as any)._id
          : report.patient,

      doctor:
        typeof report.doctor ===
        'object'
          ? (report.doctor as any)._id
          : report.doctor,

      reportType:
        report.reportType,

      title:
        report.title,

      diagnosis:
        report.diagnosis,

      findings:
        report.findings || '',

      recommendations:
        report.recommendations ||
        '',

      reportDate:
        report.reportDate
          ? report.reportDate.substring(
              0,
              10
            )
          : '',
    });

    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.saving = false;
    this.formError = '';
  }

  onSubmit(): void {

    this.formError = '';

    if (this.form.invalid) {

      this.form.markAllAsTouched();

      this.formError =
        'من فضلك املأ جميع الحقول المطلوبة.';

      this.cdr.detectChanges();

      return;
    }

    this.saving = true;

    const payload: MedicalReport =
      this.form.value;

    const request$ =
      this.isEditMode &&
      this.editingId
        ? this.reportService.updateReport(
            this.editingId,
            payload
          )
        : this.reportService.createReport(
            payload
          );

    request$.subscribe({

      next: () => {

        this.saving = false;

        this.closeModal();

        this.loadAll();
      },

      error: (error) => {

        this.saving = false;

        this.formError =
          error?.error?.message ||
          'حدث خطأ ما. يرجى مراجعة البيانات والمحاولة مرة أخرى.';

        this.cdr.detectChanges();
      },

    });
  }

  confirmDelete(
    report: MedicalReport
  ): void {

    if (!this.canManage) {
      return;
    }

    this.deleteTarget = report;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  deleteReport(): void {

    if (!this.deleteTarget?._id) {
      return;
    }

    this.deleting = true;

    this.reportService
      .deleteReport(
        this.deleteTarget._id
      )
      .subscribe({

        next: () => {

          this.deleting = false;
          this.deleteTarget = null;

          this.loadAll();
        },

        error: (error) => {

          this.deleting = false;

          this.errorMessage =
            error?.error?.message ||
            'فشل حذف التقرير الطبي.';

          this.deleteTarget = null;

          this.cdr.detectChanges();
        },

      });
  }
}