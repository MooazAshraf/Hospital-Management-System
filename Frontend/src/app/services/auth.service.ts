import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iuser } from '../models/users.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSubject = new BehaviorSubject<Iuser | null>(this.getUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  login(token: string, user: Iuser): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): Iuser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? (JSON.parse(raw) as Iuser) : null;
    } catch {
      this.logout();
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  hasRole(...roles: Array<Iuser['role']>): boolean {
    const role = this.getUser()?.role;
    return !!role && roles.includes(role);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}
