import { Component, OnInit, inject } from '@angular/core';
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

  users: Iuser[] = [];
  loading = false;
  errorMessage = '';
  savingId = '';
  search = '';

  get filteredUsers(): Iuser[] {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.users;
    return this.users.filter((u) =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (res) => { this.users = res.users || []; this.loading = false; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to load users'; this.loading = false; },
    });
  }

  updateRole(user: Iuser, role: Iuser['role']): void {
    this.savingId = user._id;
    this.usersService.updateProfile(user._id, { role } as any).subscribe({
      next: (res) => {
        const index = this.users.findIndex((u) => u._id === user._id);
        if (index >= 0) this.users[index] = { ...this.users[index], ...res.user };
        this.savingId = '';
      },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update role'; this.savingId = ''; },
    });
  }

  toggleActive(user: Iuser): void {
    this.savingId = user._id;
    this.usersService.updateProfile(user._id, { isActive: !user.isActive } as any).subscribe({
      next: (res) => {
        const index = this.users.findIndex((u) => u._id === user._id);
        if (index >= 0) this.users[index] = { ...this.users[index], ...res.user };
        this.savingId = '';
      },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update account'; this.savingId = ''; },
    });
  }

  deleteUser(user: Iuser): void {
    if (!confirm(`Delete ${user.name}?`)) return;
    this.usersService.deleteUser(user._id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => this.errorMessage = err?.error?.message || 'Failed to delete user',
    });
  }
}
