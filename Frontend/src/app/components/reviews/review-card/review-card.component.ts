import { Component, Input } from '@angular/core';

import { Review } from '../../models';

@Component({
selector: 'app-review-card',
standalone: true,
templateUrl: './review-card.component.html'
})
export class ReviewCardComponent {

@Input({ required: true }) review!: Review;

}
