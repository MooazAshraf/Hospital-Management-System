import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private apiUrl = 'http://localhost:5000/api/patients';

  constructor(private http: HttpClient) {}

  // ==========================
  // Patient Profile Routes
  // ==========================

  getMyProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/me`);
  }

  // ==========================
  // Admin CRUD Routes
  // ==========================

  getAllPatients(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  getPatientById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createPatient(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updatePatient(id: string, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // ==========================
  // Aliases for Compatibility
  // ==========================
  createProfile(data: any): Observable<any> {
    return this.createPatient(data);
  }

  updateProfile(id: string, data: any): Observable<any> {
    return this.updatePatient(id, data);
  }
  saveMyProfile(data: any) {
    return this.http.put(`${this.apiUrl}/patients/me`, data);
  }
}
