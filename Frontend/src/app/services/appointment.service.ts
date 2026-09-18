import { Injectable, inject } from '@angular/core';
import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import { Observable } from 'rxjs';

import {
  AppointmentListResponse,
  AppointmentResponse,
  AvailableSlotsResponse,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../models/appointment.model';

const API_BASE_URL =
  'http://localhost:3000/api';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    `${API_BASE_URL}/appointments`;

  getAll(): Observable<AppointmentListResponse> {
    return this.http.get<AppointmentListResponse>(
      this.baseUrl
    );
  }

  getById(
    id: string
  ): Observable<AppointmentResponse> {
    return this.http.get<AppointmentResponse>(
      `${this.baseUrl}/${id}`
    );
  }

  create(
    payload: CreateAppointmentPayload
  ): Observable<AppointmentResponse> {
    return this.http.post<AppointmentResponse>(
      this.baseUrl,
      payload
    );
  }

  update(
    id: string,
    payload: UpdateAppointmentPayload
  ): Observable<AppointmentResponse> {
    return this.http.put<AppointmentResponse>(
      `${this.baseUrl}/${id}`,
      payload
    );
  }

  cancel(
    id: string
  ): Observable<AppointmentResponse> {
    return this.update(id, {
      status: 'Cancelled',
    });
  }

  delete(
    id: string
  ): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(`${this.baseUrl}/${id}`);
  }

  getAvailableSlots(
    doctorId: string,
    date: string
  ): Observable<AvailableSlotsResponse> {
    const params = new HttpParams()
      .set('doctor', doctorId)
      .set('date', date);

    return this.http.get<AvailableSlotsResponse>(
      `${this.baseUrl}/available-slots`,
      { params }
    );
  }
}