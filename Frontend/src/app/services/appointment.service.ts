import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Appointment {
  _id?: string;
  patient?: any;
  doctor?: any;
  date: string;
  time: string;
  status?: 'Pending' | 'Completed' | 'Cancelled' | 'Confirmed';
  appointmentType?: string;
  queueNumber?: number;
  notes?: string;
  diagnosis?: string;
  isFollowUpAllowed?: boolean;
  followUpDeadline?: string;
}

export interface AppointmentApiResponse {
  success: boolean;
  count?: number;
  data: any;
  message?: string;
}

export interface CreateAppointmentPayload {
  doctor: string;
  date: string;
  time: string;
  appointmentType?: string;
  notes?: string;
}

export interface UpdateAppointmentPayload {
  status?: string;
  notes?: string;
  date?: string;
  time?: string;
  [key: string]: any;
}

export interface AvailableSlotsResponse {
  success: boolean;
  availableSlots: string[];
}

const API_BASE_URL = 'http://localhost:5000/api';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${API_BASE_URL}/appointments`;

  // ==========================
  // Core API Methods
  // ==========================

  getAll(): Observable<AppointmentApiResponse> {
    return this.http.get<AppointmentApiResponse>(this.baseUrl);
  }

  getById(id: string): Observable<AppointmentApiResponse> {
    return this.http.get<AppointmentApiResponse>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateAppointmentPayload): Observable<AppointmentApiResponse> {
    return this.http.post<AppointmentApiResponse>(this.baseUrl, payload);
  }

  update(id: string, payload: UpdateAppointmentPayload): Observable<AppointmentApiResponse> {
    return this.http.put<AppointmentApiResponse>(`${this.baseUrl}/${id}`, payload);
  }

  cancel(id: string): Observable<AppointmentApiResponse> {
    return this.update(id, { status: 'Cancelled' });
  }

  delete(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }

  getAvailableSlots(doctorId: string, date: string): Observable<AvailableSlotsResponse> {
    const params = new HttpParams().set('doctor', doctorId).set('date', date);
    return this.http.get<AvailableSlotsResponse>(`${this.baseUrl}/available-slots`, { params });
  }

  // ==========================
  // Backward Compatibility Aliases
  // ==========================

  getAllAppointments(): Observable<AppointmentApiResponse> {
    return this.getAll();
  }

  getAppointmentById(id: string): Observable<AppointmentApiResponse> {
    return this.getById(id);
  }

  createAppointment(payload: CreateAppointmentPayload): Observable<AppointmentApiResponse> {
    return this.create(payload);
  }

  updateAppointment(
    id: string,
    payload: UpdateAppointmentPayload,
  ): Observable<AppointmentApiResponse> {
    return this.update(id, payload);
  }

  cancelAppointment(id: string): Observable<AppointmentApiResponse> {
    return this.cancel(id);
  }
}
