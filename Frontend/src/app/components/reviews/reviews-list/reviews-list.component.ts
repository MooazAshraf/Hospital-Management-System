import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewCardComponent } from '../review-card/review-card.component';
import { Review } from '../../models';
import { ReviewsService } from '../../../services/reviews.service';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent],
  templateUrl: './reviews-list.component.html'
})
export class ReviewsListComponent implements OnInit {

  reviews: Review[] = [];

  constructor(private reviewsService: ReviewsService) {}

  ngOnInit(): void {
    this.reviewsService.getReviews().subscribe({
      next: (response) => {
        this.reviews = response.data;
      },
      error: (error) => {
        console.error('Error fetching reviews:', error);
      }
    });
  }
}
