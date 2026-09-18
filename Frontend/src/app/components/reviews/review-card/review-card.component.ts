import { Component, Input } from '@angular/core';
import { IReview } from '../../../models/review.model';

@Component({
  selector: 'app-review-card',
  standalone: true,
  templateUrl: './review-card.component.html'
})
export class ReviewCardComponent {
  @Input({ required: true }) review!: IReview;
}
