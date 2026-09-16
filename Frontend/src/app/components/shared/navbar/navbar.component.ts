  import { Component } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { Router, RouterLink } from '@angular/router';
import { Iuser } from '../../../models/users.model';
import { AuthService } from '../../../services/auth.service';



  @Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './navbar.component.html',
  })
  export class NavbarComponent {
    mobileOpen = false;
    user: Iuser | null = null;
    dropdownOpen = false;

    constructor(
      private authService: AuthService,
      private router: Router,
    ) {
      this.user = this.authService.getUser();
    }

    toggleDropdown() {
      this.dropdownOpen = !this.dropdownOpen;
    }

    goToProfile() {
      this.dropdownOpen = false;
      this.router.navigate(['/profile']);
    }

    logout() {
      this.authService.logout();
      this.dropdownOpen = false;
      this.router.navigate(['/login']);
    }
  }
