import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { Department } from '../models';

interface DepartmentsResponse {
  success?: boolean;
  count?: number;
  data: Department[];
}

interface DepartmentResponse {
  success?: boolean;
  message?: string;
  data: Department;
}

@Injectable({ providedIn: 'root' })
export class DepartmentsService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:5000/api/departments';

  getAll(): Observable<DepartmentsResponse> {
    return this.http.get<DepartmentsResponse>(this.baseUrl);
  }

  // NOTE: the backend only exposes GET / (no GET /:id), so a single
  // department is found by filtering the full list client-side.
  // If a GET /api/departments/:id route gets added later, swap this for
  // a direct this.http.get call — that'll be faster once there are a lot
  // of departments.
  getById(id: string): Observable<Department | undefined> {
    return this.getAll().pipe(
      map((res) => (res.data || []).find((d) => d._id === id)),
    );
  }

  create(data: {
    name: string;
    description: string;
    image: string;
  }): Observable<DepartmentResponse> {
    return this.http.post<DepartmentResponse>(this.baseUrl, data);
  }

  update(
    id: string,
    data: Partial<{ name: string; description: string; image: string; isActive: boolean }>,
  ): Observable<DepartmentResponse> {
    return this.http.put<DepartmentResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success?: boolean; message: string }> {
    return this.http.delete<{ success?: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
