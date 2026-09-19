import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};

export const roleGuard = (roles: Array<'user' | 'doctor' | 'admin'>): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getUser();

    if (!user) {
      return router.createUrlTree(['/login']);
    }

    return roles.includes(user.role) ? true : router.createUrlTree(['/']);
  };
};
