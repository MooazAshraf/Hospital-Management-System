import { Component, Input } from '@angular/core';

export interface Appointment {
  doctorName: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
}

// TODO(Person 5): used in both the patient dashboard and admin appointments
// table — style the status badge per value.
@Component({
  selector: 'app-appointment-card',
  standalone: true,
  templateUrl: './appointment-card.component.html'
})
export class AppointmentCardComponent {
  @Input({ required: true }) appointment!: Appointment;
}
