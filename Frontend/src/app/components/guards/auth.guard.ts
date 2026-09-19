import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const roleGuard = (
  allowedRoles: string[]
): CanActivateFn => {

  return () => {

    const authService = inject(AuthService);
    const router = inject(Router);

    // لازم يكون عامل Login
    if (!authService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const user = authService.getUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    // هل الـ role مسموح؟
    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Admin
    if (user.role === 'admin') {
      return router.createUrlTree(['/admin-dashboard']);
    }

    // Doctor
    if (user.role === 'doctor') {
      return router.createUrlTree(['/doctor-dashboard']);
    }

    // User / Patient
    return router.createUrlTree(['/patient-dashboard']);
  };
};