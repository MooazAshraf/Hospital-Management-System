import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Review } from '../components/models';

interface ReviewsResponse {
  success: boolean;
  count: number;
  data: Review[];
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
