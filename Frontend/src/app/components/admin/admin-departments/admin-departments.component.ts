import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentApi, DepartmentService } from '../../../services/department.service';

@Component({
  selector: 'app-admin-departments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-departments.component.html',
})
export class AdminDepartmentsComponent implements OnInit {
  private readonly service = inject(DepartmentService);

  departments: DepartmentApi[] = [];
  loading = false;
  saving = false;
  errorMessage = '';
  showModal = false;
  editingId: string | null = null;
  form: Omit<DepartmentApi, '_id'> = { name: '', description: '', image: '', isActive: true };

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.service.getAll().subscribe({
      next: (data) => { this.departments = data; this.loading = false; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to load departments'; this.loading = false; },
    });
  }

  openAdd(): void {
    this.editingId = null;
    this.form = { name: '', description: '', image: '', isActive: true };
    this.errorMessage = '';
    this.showModal = true;
  }

  openEdit(item: DepartmentApi): void {
    this.editingId = item._id || null;
    this.form = { name: item.name, description: item.description, image: item.image, isActive: item.isActive !== false };
    this.errorMessage = '';
    this.showModal = true;
  }

  close(): void { this.showModal = false; this.saving = false; }

  save(): void {
    if (!this.form.name.trim() || !this.form.description.trim() || !this.form.image.trim()) {
      this.errorMessage = 'Name, description and image are required.';
      return;
    }
    this.saving = true;
    const request$ = this.editingId ? this.service.update(this.editingId, this.form) : this.service.create(this.form);
    request$.subscribe({
      next: () => { this.close(); this.load(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to save department'; this.saving = false; },
    });
  }

  remove(item: DepartmentApi): void {
    if (!item._id || !confirm(`Deactivate ${item.name}?`)) return;
    this.service.delete(item._id).subscribe({
      next: () => this.load(),
      error: (err) => this.errorMessage = err?.error?.message || 'Failed to deactivate department',
    });
  }
}
