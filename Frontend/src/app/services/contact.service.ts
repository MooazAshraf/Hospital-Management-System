import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ContactStatus =
  | 'New'
  | 'Read'
  | 'Responded'
  | 'Resolved';

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  count?: number;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl =
    'http://localhost:5000/api/contact';

  // ==========================================
  // Send contact message
  // ==========================================

  sendMessage(
    data: CreateContactMessage
  ): Observable<ApiResponse<ContactMessage>> {
    return this.http.post<ApiResponse<ContactMessage>>(
      this.baseUrl,
      data
    );
  }

  // ==========================================
  // Get all messages
  // ==========================================

  getAll(): Observable<ApiResponse<ContactMessage[]>> {
    return this.http.get<ApiResponse<ContactMessage[]>>(
      this.baseUrl
    );
  }

  // Alias
  getMessages(): Observable<ApiResponse<ContactMessage[]>> {
    return this.getAll();
  }

  // ==========================================
  // Get one message
  // ==========================================

  getMessage(
    id: string
  ): Observable<ApiResponse<ContactMessage>> {
    return this.http.get<ApiResponse<ContactMessage>>(
      `${this.baseUrl}/${id}`
    );
  }

  // ==========================================
  // Update status
  // ==========================================

  updateStatus(
    id: string,
    status: ContactStatus
  ): Observable<ApiResponse<ContactMessage>> {
    return this.http.put<ApiResponse<ContactMessage>>(
      `${this.baseUrl}/${id}/status`,
      { status }
    );
  }

  // ==========================================
  // Delete message
  // ==========================================

  delete(
    id: string
  ): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.baseUrl}/${id}`
    );
  }

  // Alias
  deleteMessage(
    id: string
  ): Observable<ApiResponse<null>> {
    return this.delete(id);
  }
}