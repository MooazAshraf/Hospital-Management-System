import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DepartmentCardComponent } from '../../departments/department-card/department-card.component';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';
import { DoctorService } from '../../../services/doctor.service';
import { DepartmentsService } from '../../../services/department.service';
import { Department } from '../../../models/department.model';
import { Doctor, DoctorDepartment } from '../../../models/doctor.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, DepartmentCardComponent, ImagePathPipe],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  private readonly departmentService = inject(DepartmentsService);
  private readonly doctorService = inject(DoctorService);
  private readonly cdr = inject(ChangeDetectorRef);

  // =====================================================
  // TOP DEPARTMENTS (بيانات حقيقية من الـ API)
  // =====================================================

  topDepartments: Department[] = [];
  departmentsLoading = false;
  departmentsError = '';

  private readonly maxTopDepartments = 4;

  // =====================================================
  // TOP DOCTORS (بيانات حقيقية من الـ API)
  // =====================================================

  topDoctors: Doctor[] = [];
  doctorsLoading = false;
  doctorsError = '';

  private readonly maxTopDoctors = 6;

  ngOnInit(): void {
    this.loadTopDepartments();
    this.loadTopDoctors();
  }

  private loadTopDepartments(): void {
    this.departmentsLoading = true;
    this.departmentService.getAll().subscribe({
      next: (res) => {
        const data = res?.data || [];
        this.topDepartments = data.slice(0, this.maxTopDepartments);
        this.departmentsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.departmentsError = 'تعذر تحميل الأقسام حالياً.';
        this.departmentsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadTopDoctors(): void {
    this.doctorsLoading = true;
    this.doctorService.getDoctors().subscribe({
      next: (data) => {
        // بنعرض المتاحين بس، ولو مفيش كفاية بنكمل بالباقي
        const available = data.filter((d) => d.isAvailable);
        const pool = available.length > 0 ? available : data;
        this.topDoctors = pool.slice(0, this.maxTopDoctors);
        this.doctorsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.doctorsError = 'تعذر تحميل الأطباء حالياً.';
        this.doctorsLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  departmentName(doctor: Doctor): string {
    const dept = doctor.department;
    if (dept && typeof dept === 'object') {
      return (dept as DoctorDepartment).name;
    }
    return doctor.specialty || '';
  }
}
