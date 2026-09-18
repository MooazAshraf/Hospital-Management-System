import { Injectable } from '@angular/core';
import { Iuser } from '../models/users.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  login(token: string, user: Iuser) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
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
  }
}
