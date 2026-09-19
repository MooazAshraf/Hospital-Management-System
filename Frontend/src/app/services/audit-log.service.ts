import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';

import {
  inject,
  Injectable,
} from '@angular/core';

import { Observable } from 'rxjs';

import { AuthService } from './auth.service';


export interface AuditLog {
  _id?: string;

  action?: string;

  collectionName?: string;

  documentId?: string | null;

  performedBy?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  } | null;

  relatedPatient?: string | null;

  relatedDoctor?: string | null;

  description?: string;

  oldData?: any;

  newData?: any;

  ipAddress?: string;

  userAgent?: string;

  createdAt?: string;

  updatedAt?: string;
}


export interface AuditLogsResponse {
  success: boolean;

  data: AuditLog[];

  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  message?: string;
}


@Injectable({
  providedIn: 'root',
})
export class AuditLogService {

  private readonly http =
    inject(HttpClient);

  private readonly authService =
    inject(AuthService);

  private readonly baseUrl =
    'http://localhost:5000/api/auditLogs';


  getAuditLogs(): Observable<AuditLogsResponse> {

    const token =
      this.authService.getToken();

    let headers =
      new HttpHeaders();

    if (token) {
      headers = headers.set(
        'Authorization',
        `Bearer ${token}`
      );
    }

    return this.http.get<AuditLogsResponse>(
      this.baseUrl,
      {
        headers,
      }
    );
  }
}