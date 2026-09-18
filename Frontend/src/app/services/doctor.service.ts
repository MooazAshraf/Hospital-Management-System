import { Injectable, inject } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable, map } from 'rxjs';

import { Doctor } from '../models/doctor.model';

const API_BASE_URL = 'http://localhost:5000/api';

interface DoctorsResponse {
  message: string;
  count: number;
  doctors: Doctor[];
}

interface DoctorResponse {
  message: string;
  doctor: Doctor;
}

@Injectable({
  providedIn: 'root',
})
export class DoctorService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = `${API_BASE_URL}/doctors`;

  getDoctors(): Observable<Doctor[]> {
    return this.http.get<DoctorsResponse>(this.baseUrl).pipe(map((response) => response.doctors));
  }

  getDoctorById(id: string): Observable<Doctor> {
    return this.http
      .get<DoctorResponse>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.doctor));
  }

  createDoctor(data: any): Observable<Doctor> {
    return this.http
      .post<DoctorResponse>(this.baseUrl, data)
      .pipe(map((response) => response.doctor));
  }

  updateDoctor(id: string, data: any): Observable<Doctor> {
    return this.http
      .put<DoctorResponse>(`${this.baseUrl}/${id}`, data)
      .pipe(map((response) => response.doctor));
  }

  deleteDoctor(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  
}
