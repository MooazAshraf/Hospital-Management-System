import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MedicalReport } from '../medical-report.model';

interface MutationResponse {
  message: string;
  data: MedicalReport;
}

// Minimal shape we need from /api/users/basic — kept local so this partition
// doesn't depend on the (currently inconsistent) shared user models.
export interface SimpleUser {
  _id: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
}

interface UsersResponse {
  message: string;
  users: SimpleUser[];
}

@Injectable({
  providedIn: 'root'
})
export class MedicalReportService {

  private apiUrl = 'http://localhost:5000/api/medicalReports';
  // Scoped, read-only directory endpoint (id + name + role only).
  // Open to every authenticated role, unlike /api/users which stays
  // doctor/admin-only since it returns full user records.
  private usersUrl = 'http://localhost:5000/api/users/basic';

  constructor(private http: HttpClient) {}

  getReports(): Observable<MedicalReport[]> {
    return this.http.get<MedicalReport[]>(this.apiUrl);
  }

  getReport(id: string): Observable<MedicalReport> {
    return this.http.get<MedicalReport>(`${this.apiUrl}/${id}`);
  }

  createReport(report: MedicalReport): Observable<MutationResponse> {
    return this.http.post<MutationResponse>(this.apiUrl, report);
  }

  updateReport(id: string, report: MedicalReport): Observable<MutationResponse> {
    return this.http.put<MutationResponse>(`${this.apiUrl}/${id}`, report);
  }

  deleteReport(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // Used to resolve patient/doctor names and to populate the dropdowns
  // in the create/edit form, since the backend stores raw ObjectIds
  // and does not populate them.
  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(this.usersUrl);
  }
}