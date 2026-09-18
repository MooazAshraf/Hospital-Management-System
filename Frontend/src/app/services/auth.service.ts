import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Iuser } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<Iuser | null>(this.getUser());
  currentUser$ = this.currentUserSubject.asObservable();

  login(token: string, user: Iuser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  getUser(): Iuser | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
}