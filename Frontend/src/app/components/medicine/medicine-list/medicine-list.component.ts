import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MedicineService } from '../services/medicine.service';
import { Medicine, emptyMedicine } from '../medicine.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-medicine-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './medicine-list.component.html'
})
export class MedicineListComponent implements OnInit {

  medicines: Medicine[] = [];
  filteredMedicines: Medicine[] = [];
  categories: string[] = [];

  // Only doctors and admins can add/edit/delete medicines.
  canManage = false;

  loading = false;
  errorMessage = '';

  searchTerm = '';
  categoryFilter = '';

  // Modal state
  showModal = false;
  isEditMode = false;
  editingId: string | null = null;
  saving = false;
  formError = '';

  // Delete confirm state
  deleteTarget: Medicine | null = null;
  deleting = false;

  form: FormGroup;

  constructor(
    private medicineService: MedicineService,
    private fb: FormBuilder,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      genericName: ['', [Validators.required]],
      category: ['', [Validators.required]],
      manufacturer: ['', [Validators.required]],
      unit: ['', [Validators.required]],
      pricePerUnit: [0, [Validators.required, Validators.min(0)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      expiryDate: ['', [Validators.required]],
      requiresPrescription: [false],
    });
  }

  ngOnInit(): void {
    this.canManage = this.authService.hasRole('doctor', 'admin');
    this.loadMedicines();
  }

  get f() {
    return this.form.controls;
  }

  loadMedicines(): void {
    this.loading = true;
    this.errorMessage = '';

    this.medicineService.getMedicines().subscribe({
      next: (data) => {
        this.medicines = data || [];
        this.categories = Array.from(
          new Set(this.medicines.map((m) => m.category).filter(Boolean))
        ).sort();
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to load medicines. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredMedicines = this.medicines.filter((m) => {
      const matchesSearch =
        !term ||
        m.name?.toLowerCase().includes(term) ||
        m.genericName?.toLowerCase().includes(term) ||
        m.manufacturer?.toLowerCase().includes(term);

      const matchesCategory = !this.categoryFilter || m.category === this.categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  onCategoryChange(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }

  isExpired(dateStr: string): boolean {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
  }

  isExpiringSoon(dateStr: string): boolean {
    if (!dateStr) return false;
    const days = (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 30;
  }

  isLowStock(qty: number): boolean {
    return qty <= 10;
  }

  get lowStockCount(): number {
    return this.medicines.filter((m) => this.isLowStock(m.stockQuantity)).length;
  }

  get expiringCount(): number {
    return this.medicines.filter(
      (m) => this.isExpired(m.expiryDate) || this.isExpiringSoon(m.expiryDate)
    ).length;
  }

  // ---------- Modal (Add / Edit) ----------

  openAddModal(): void {
    if (!this.canManage) return;
    this.isEditMode = false;
    this.editingId = null;
    this.formError = '';
    this.form.reset(emptyMedicine());
    this.showModal = true;
  }

  openEditModal(medicine: Medicine): void {
    if (!this.canManage) return;
    this.isEditMode = true;
    this.editingId = medicine._id ?? null;
    this.formError = '';

    this.form.reset({
      name: medicine.name,
      genericName: medicine.genericName,
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      unit: medicine.unit,
      pricePerUnit: medicine.pricePerUnit,
      stockQuantity: medicine.stockQuantity,
      expiryDate: medicine.expiryDate ? medicine.expiryDate.substring(0, 10) : '',
      requiresPrescription: medicine.requiresPrescription,
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
      return;
    }

    this.saving = true;
    const payload: Medicine = this.form.value;

    const request$ = this.isEditMode && this.editingId
      ? this.medicineService.updateMedicine(this.editingId, payload)
      : this.medicineService.createMedicine(payload);

    request$.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadMedicines();
      },
      error: (error) => {
        this.saving = false;
        this.formError = error?.error?.message || 'Something went wrong. Please check your input and try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // ---------- Delete ----------

  confirmDelete(medicine: Medicine): void {
    if (!this.canManage) return;
    this.deleteTarget = medicine;
  }

  cancelDelete(): void {
    this.deleteTarget = null;
  }

  deleteMedicine(): void {
    if (!this.deleteTarget?._id) return;

    this.deleting = true;

    this.medicineService.deleteMedicine(this.deleteTarget._id).subscribe({
      next: () => {
        this.deleting = false;
        this.deleteTarget = null;
        this.loadMedicines();
      },
      error: (error) => {
        this.deleting = false;
        this.errorMessage = error?.error?.message || 'Failed to delete medicine.';
        this.deleteTarget = null;
        this.cdr.detectChanges();
      }
    });
  }
}
