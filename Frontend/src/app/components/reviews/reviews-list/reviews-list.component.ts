import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent } from '../review-card/review-card.component';
import { Review } from '../../models';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent],
  templateUrl: './reviews-list.component.html'
})
export class ReviewsListComponent {
  // TODO(Person 4): replace with ReviewsService.getFeatured() -> GET /api/reviews
  reviews: Review[] = [
    { quote: 'Booked a cardiology appointment the same evening and was seen within three days.', name: 'Mona Hassan', role: 'Patient, Cardiology' },
    { quote: "My son's pediatrician had his full vaccination history on screen before we even sat down.", name: 'Youssef Adel', role: 'Parent, Pediatrics' },
    { quote: 'The emergency team moved fast and kept us informed the whole time.', name: 'Rania Kamel', role: 'Patient, Emergency' }
  ];
}
