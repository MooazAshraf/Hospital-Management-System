import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DoctorCardComponent } from '../doctor-card/doctor-card.component';
import { Doctor } from '../../models';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, DoctorCardComponent],
  templateUrl: './doctors-list.component.html'
})
export class DoctorsListComponent {
  // TODO(Person 1): replace with DoctorsService.getFeatured() -> GET /api/doctors
  doctors: Doctor[] = [
    { name: 'Dr. Amina Youssef', specialty: 'Cardiology', experienceYears: 14 },
    { name: 'Dr. Karim El-Sayed', specialty: 'Orthopedics', experienceYears: 9 },
    { name: 'Dr. Salma Farid', specialty: 'Pediatrics', experienceYears: 11 },
    { name: 'Dr. Tarek Mansour', specialty: 'Neurology', experienceYears: 16 }
  ];
}
