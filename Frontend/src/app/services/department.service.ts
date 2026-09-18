import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface DepartmentApi {
  _id?: string;
  name: string;
  description: string;
  image: string;
  isActive?: boolean;
}

interface DepartmentResponse { success?: boolean; data: DepartmentApi[]; }
interface MutationResponse { success?: boolean; message: string; data: DepartmentApi; }

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:5000/api/departments';

  getAll(): Observable<DepartmentApi[]> {
    return this.http.get<DepartmentResponse>(this.baseUrl).pipe(map((r) => r.data || []));
  }

  create(data: Omit<DepartmentApi, '_id'>): Observable<MutationResponse> {
    return this.http.post<MutationResponse>(this.baseUrl, data);
  }

  update(id: string, data: Partial<DepartmentApi>): Observable<MutationResponse> {
    return this.http.put<MutationResponse>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: string): Observable<{ success?: boolean; message: string }> {
    return this.http.delete<{ success?: boolean; message: string }>(`${this.baseUrl}/${id}`);
  }
}
