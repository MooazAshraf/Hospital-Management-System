import { Component } from '@angular/core';

// TODO(Person 1): pull today's appointments for the logged-in doctor from
// AppointmentsService (GET /api/appointments?doctorId=&date=today) and list
// them here — patient name, time, reason for visit, status.
@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  templateUrl: './doctor-dashboard.component.html',
})
export class DoctorDashboardComponent {}
