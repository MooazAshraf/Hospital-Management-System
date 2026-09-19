import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Iuser } from '../models/users.model';
import { ILoginResponse } from '../models/loginResponse';
import { IRegisterResponse } from '../models/registerResponse';

interface UsersResponse {
  success?: boolean;
  message?: string;
  count?: number;
  users: Iuser[];
}

interface IuserResponse {
  success?: boolean;
  message?: string;
  user: Iuser;
}

@Injectable({ providedIn: 'root' })
export class UserServices {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:5000/api/users';

  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.baseUrl);
  }

  getUserById(id: string): Observable<{ user: Iuser; message: string }> {
    return this.http.get<{ user: Iuser; message: string }>(`${this.baseUrl}/${id}`);
  }

  register(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }): Observable<IRegisterResponse> {
    return this.http.post<IRegisterResponse>(`${this.baseUrl}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.baseUrl}/login`, data);
  }

  updateProfile(
    id: string,
    data: Partial<{
      name: string;
      email: string;
      phone: string;
      password: string;
      role: 'user' | 'doctor' | 'admin';
      isActive: boolean;
    }>,
  ): Observable<IuserResponse> {
    return this.http.put<IuserResponse>(`${this.baseUrl}/${id}`, data);
  }

  deleteUser(id: string): Observable<{ success?: boolean; message: string }> {
    return this.http.delete<{ success?: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  addStaff(data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'doctor' | 'admin';
  }): Observable<{
    success?: boolean;
    message: string;
    user: Iuser;
  }> {
    return this.http.post<{
      success?: boolean;
      message: string;
      user: Iuser;
    }>(`${this.baseUrl}/staff`, data);
  }
}
