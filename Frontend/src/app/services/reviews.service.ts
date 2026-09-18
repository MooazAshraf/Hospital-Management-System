import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IReview } from '../models/review.model';
interface ReviewsResponse {
  success: boolean;
  count: number;
  data: IReview[];
}

@Injectable({
  providedIn: 'root'
})
export class ReviewsService {

  private apiUrl = 'http://localhost:5000/api/reviews';

  constructor(private http: HttpClient) {}

  getReviews(): Observable<ReviewsResponse> {
    return this.http.get<ReviewsResponse>(this.apiUrl);
  }
}
