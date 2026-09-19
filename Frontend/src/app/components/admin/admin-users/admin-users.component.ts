import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { UserServices } from '../../../services/users.service';
import { Iuser } from '../../../models/users.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-users.component.html',
})
export class AdminUsersComponent implements OnInit {
  private readonly usersService = inject(UserServices);
  private readonly cdr = inject(ChangeDetectorRef);

  users: Iuser[] = [];
  loading = false;
  errorMessage = '';
  savingId = '';
  search = '';

  get filteredUsers(): Iuser[] {
    const term = this.search.trim().toLowerCase();

    if (!term) {
      return this.users;
    }

    return this.users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.usersService.getUsers().subscribe({
      next: (res) => {
        this.users = res.users || [];
        this.loading = false;
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'فشل تحميل المستخدمين.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateRole(user: Iuser, role: Iuser['role']): void {
    this.savingId = user._id;
    this.errorMessage = '';

    this.usersService.updateProfile(user._id, { role }).subscribe({
      next: (res) => {
        const index = this.users.findIndex(
          (u) => u._id === user._id
        );

        if (index >= 0) {
          this.users[index] = {
            ...this.users[index],
            ...res.user,
          };
        }

        this.savingId = '';
        this.cdr.detectChanges();
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'فشل تحديث صلاحية المستخدم.';
        this.savingId = '';
        this.cdr.detectChanges();
      },
    });
  }

  toggleActive(user: Iuser): void {
    this.savingId = user._id;
    this.errorMessage = '';

    this.usersService
      .updateProfile(user._id, {
        isActive: !user.isActive,
      })
      .subscribe({
        next: (res) => {
          const index = this.users.findIndex(
            (u) => u._id === user._id
          );

          if (index >= 0) {
            this.users[index] = {
              ...this.users[index],
              ...res.user,
            };
          }

          this.savingId = '';
          this.cdr.detectChanges();
        },

        error: (err) => {
          this.errorMessage =
            err?.error?.message || 'فشل تحديث حالة الحساب.';
          this.savingId = '';
          this.cdr.detectChanges();
        },
      });
  }

  deleteUser(user: Iuser): void {
    if (!confirm(`هل أنت متأكد من حذف المستخدم ${user.name}؟`)) {
      return;
    }

    this.usersService.deleteUser(user._id).subscribe({
      next: () => {
        this.loadUsers();
      },

      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'فشل حذف المستخدم.';
        this.cdr.detectChanges();
      },
    });
  }
}