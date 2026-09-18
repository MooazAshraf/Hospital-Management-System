import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Medicine } from '../medicine.model';

interface MutationResponse {
  message: string;
  data: Medicine;
}

@Injectable({
  providedIn: 'root'
})
export class MedicineService {

  private apiUrl = 'http://localhost:3000/api/medicines';

  constructor(private http: HttpClient) {}

  getMedicines(): Observable<Medicine[]> {
    return this.http.get<Medicine[]>(this.apiUrl);
  }

  getMedicine(id: string): Observable<Medicine> {
    return this.http.get<Medicine>(`${this.apiUrl}/${id}`);
  }

  createMedicine(medicine: Medicine): Observable<MutationResponse> {
    return this.http.post<MutationResponse>(this.apiUrl, medicine);
  }

  updateMedicine(id: string, medicine: Medicine): Observable<MutationResponse> {
    return this.http.put<MutationResponse>(`${this.apiUrl}/${id}`, medicine);
  }

  deleteMedicine(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
