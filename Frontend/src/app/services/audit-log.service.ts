import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuditLogService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  private baseUrl = 'http://localhost:5000/api/auditLogs';

  getAuditLogs(): Observable<any> {
    const token = this.authService.getToken();

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>(this.baseUrl, { headers });
  }
}