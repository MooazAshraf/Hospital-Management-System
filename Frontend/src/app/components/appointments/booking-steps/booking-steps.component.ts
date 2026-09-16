import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step { title: string; desc: string; }

@Component({
  selector: 'app-booking-steps',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-steps.component.html'
})
export class BookingStepsComponent {
  steps: Step[] = [
    { title: 'Choose a department', desc: "Pick the specialty that matches how you're feeling." },
    { title: 'Pick a doctor and time', desc: 'See real availability, not just a request form.' },
    { title: 'Confirm your details', desc: 'Add your reason for the visit so the doctor comes prepared.' },
    { title: 'Get instant confirmation', desc: 'Your appointment appears immediately in your dashboard.' }
  ];
}
