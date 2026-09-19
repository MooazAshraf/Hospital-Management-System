import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReviewCardComponent } from '../review-card/review-card.component';
import { IReview } from '../../../models/review.model';
import { ReviewsService } from '../../../services/reviews.service';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent],
  templateUrl: './reviews-list.component.html'
})
export class ReviewsListComponent implements OnInit {

  reviews: IReview[] = [];
  showAll = false;

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

  get displayedReviews(): IReview[] {
    return this.showAll ? this.reviews : this.reviews.slice(0, 2);
  }

  toggleReviews(): void {
    this.showAll = !this.showAll;
  }
}
