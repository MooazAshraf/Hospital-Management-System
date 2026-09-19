import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';
import { DepartmentsService } from '../../../services/department.service';
import { Department } from '../../../models';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImagePathPipe,
  ],
  templateUrl: './admin-departments.component.html',
})
export class AdminDepartmentsComponent
  implements OnInit
{
  private readonly departmentsService =
    inject(DepartmentsService);

  private readonly cdr =
    inject(ChangeDetectorRef);

  departments: Department[] = [];

  loading = false;
  errorMessage = '';
  savingId = '';

  // حالة إضافة قسم جديد
  showAddForm = false;

  newDepartment = {
    name: '',
    description: '',
    image: '',
  };

  // حالة تعديل القسم
  editingId = '';

  editDraft = {
    name: '',
    description: '',
    image: '',
  };

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentsService
      .getAll()
      .subscribe({
        next: (res) => {
          this.departments =
            res.data || [];

          this.loading = false;

          this.cdr.detectChanges();
        },

        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'فشل تحميل الأقسام.';

          this.loading = false;

          this.cdr.detectChanges();
        },
      });
  }

  submitNewDepartment(): void {
    if (
      !this.newDepartment.name ||
      !this.newDepartment.description ||
      !this.newDepartment.image
    ) {
      this.errorMessage =
        'اسم القسم والوصف والصورة جميعها مطلوبة.';

      this.cdr.detectChanges();

      return;
    }

    this.departmentsService
      .create(this.newDepartment)
      .subscribe({
        next: () => {
          this.newDepartment = {
            name: '',
            description: '',
            image: '',
          };

          this.showAddForm = false;

          this.loadDepartments();
        },

        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'فشل إنشاء القسم.';

          this.cdr.detectChanges();
        },
      });
  }

  startEdit(dept: Department): void {
    this.editingId = dept._id;

    this.editDraft = {
      name: dept.name,
      description: dept.description,
      image: dept.image,
    };
  }

  cancelEdit(): void {
    this.editingId = '';
  }

  saveEdit(dept: Department): void {
    this.savingId = dept._id;

    this.departmentsService
      .update(
        dept._id,
        this.editDraft
      )
      .subscribe({
        next: (res) => {
          const index =
            this.departments.findIndex(
              (d) => d._id === dept._id
            );

          if (index >= 0) {
            this.departments[index] = {
              ...this.departments[index],
              ...res.data,
            };
          }

          this.editingId = '';
          this.savingId = '';

          this.cdr.detectChanges();
        },

        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'فشل تحديث القسم.';

          this.savingId = '';

          this.cdr.detectChanges();
        },
      });
  }

  deleteDepartment(
    dept: Department
  ): void {
    if (
      !confirm(
        `هل أنت متأكد من حذف قسم ${dept.name}؟`
      )
    ) {
      return;
    }

    this.departmentsService
      .delete(dept._id)
      .subscribe({
        next: () => {
          this.loadDepartments();
        },

        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'فشل حذف القسم.';

          this.cdr.detectChanges();
        },
      });
  }
}