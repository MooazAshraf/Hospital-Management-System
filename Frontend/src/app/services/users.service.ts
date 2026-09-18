import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Iuser } from '../models/users.model';
import { IuserResponse } from '../models/IuserResponse';
import { IRegisterResponse } from '../models/registerResponse';
import { ILoginResponse } from '../models/loginResponse';

@Injectable({
  providedIn: 'root',
})
export class UserServices {
  users!: Iuser[];
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api/users';

  getUsers(): Observable<IuserResponse[]> {
    return this.http.get<IuserResponse[]>(this.baseUrl);
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
    }>,
  ): Observable<IuserResponse> {
    return this.http.put<IuserResponse>(`${this.baseUrl}/${id}`, data);
  }

  addStaff(data: {
    name: string;
    email: string;  
    password: string;
    phone: string;
    role: 'doctor' | 'admin';
  }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/staff`, data);
  }
}
