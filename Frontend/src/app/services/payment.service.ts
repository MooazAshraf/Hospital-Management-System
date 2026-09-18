import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Payment } from '../models/payment.model';

interface PaymentsResponse {
  success: boolean;
  count: number;
  data: Payment[];
}

interface PaymentResponse {
  success: boolean;
  data: Payment;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  private apiUrl = 'http://localhost:5000/api/payments';

  constructor(private http: HttpClient) {}

  getPayments(): Observable<PaymentsResponse> {
    return this.http.get<PaymentsResponse>(this.apiUrl);
  }

  createPayment(payment: any): Observable<PaymentResponse> {
    return this.http.post<PaymentResponse>(this.apiUrl, payment);
  }

  updatePayment(id: string, payment: any): Observable<PaymentResponse> {
    return this.http.put<PaymentResponse>(
      `${this.apiUrl}/${id}`,
      payment
    );
  }
}
