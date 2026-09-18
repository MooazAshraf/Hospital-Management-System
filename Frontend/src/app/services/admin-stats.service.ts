import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable } from 'rxjs';

export interface AdminStats {
  totalPatients: number;
  totalDoctors: number;
  appointmentsToday: number;
  pendingAppointments: number;
}

@Injectable({
  providedIn: 'root',
})
export class AdminStatsService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5000/api';

  getStats(): Observable<AdminStats> {
    return forkJoin({
      totalPatients: this.http.get<{ count: number }>(`${this.baseUrl}/patients/count`),

      totalDoctors: this.http.get<{ count: number }>(`${this.baseUrl}/doctors/count`),

      appointmentsToday: this.http.get<{ count: number }>(
        `${this.baseUrl}/appointments/count?date=today`,
      ),

      pendingAppointments: this.http.get<{ count: number }>(
        `${this.baseUrl}/appointments/count?status=Pending`,
      ),
    }).pipe(
      map((res) => ({
        totalPatients: res.totalPatients.count,
        totalDoctors: res.totalDoctors.count,
        appointmentsToday: res.appointmentsToday.count,
        pendingAppointments: res.pendingAppointments.count,
      })),
    );
  }
}
