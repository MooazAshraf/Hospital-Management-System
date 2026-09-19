import { Component, HostListener } from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';

import { AuthService } from '../../../services/auth.service';

import { NotificationBellComponent } from '../../notifications/notification-bell/notification-bell.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    NotificationBellComponent,
  ],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  isDropdownOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router,
  ) {}

  get currentUser$() {
    return this.authService.currentUser$;
  }

  getInitials(name: string): string {
    return (
      name
        ?.trim()
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase() ?? ''
    );
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isDropdownOpen = false;
  }

  onLogout() {
    this.authService.logout();
    this.isDropdownOpen = false;
    this.router.navigate(['/login']);
  }

  goToDashboard() {
    const role = this.authService.getUser()?.role;

    switch (role) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']);
        break;

      case 'doctor':
        this.router.navigate(['/doctor-dashboard']);
        break;

      default:
        this.router.navigate(['/patient-dashboard']);
    }
  }
}