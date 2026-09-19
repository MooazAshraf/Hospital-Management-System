import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentCardComponent } from '../department-card/department-card.component';
import { DepartmentsService } from '../../../services/department.service';
import { Department } from '../../../models';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, DepartmentCardComponent],
  templateUrl: './departments-list.component.html',
})
export class DepartmentsListComponent implements OnInit {
  private readonly departmentsService = inject(DepartmentsService);
  private readonly cdr = inject(ChangeDetectorRef);

  departments: Department[] = [];
  loading = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDepartments();
  }

  loadDepartments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.departmentsService.getAll().subscribe({
      next: (res) => {
        this.departments = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message || 'Failed to load departments';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
}
