import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IReview } from '../models/review.model';

interface ReviewsResponse {
  success: boolean;
  count: number;
  data: IReview[];
}

interface ReviewResponse {
  success: boolean;
  message?: string;
  data: IReview;
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {
  private readonly baseUrl =
    'http://localhost:5000/api/reviews';

  constructor(
    private readonly http: HttpClient
  ) {}

  getReviews(): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(
      this.baseUrl
    );
  }

  createReview(
    data: {
      patient: string;
      doctor: string;
      rating: number;
      comment: string;
    }
  ): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(
      this.baseUrl,
      data
    );
  }

  updateReview(
    id: string,
    data: {
      rating: number;
      comment: string;
    }
  ): Observable<ReviewResponse> {
    return this.http.put<ReviewResponse>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  deleteReview(
    id: string
  ): Observable<{
    success: boolean;
    message: string;
  }> {
    return this.http.delete<{
      success: boolean;
      message: string;
    }>(
      `${this.baseUrl}/${id}`
    );
  }
}
