import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.component.html'
})
export class HeroComponent {
  nextSlot = 'Today, 4:30 PM';
  featuredDoctor = { name: 'Dr. Amina Youssef', specialty: 'Cardiology', rating: 4.9 };
}
