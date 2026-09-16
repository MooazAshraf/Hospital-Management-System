import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../../../services/auth.service';
import { PatientService } from '../../../services/patient.service';
import { Iuser } from '../../../models/users.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent {
  user: Iuser | null = null;
  patient: any = null;

  editMode = false;

  constructor(
    private authService: AuthService,
    private patientService: PatientService,
  ) {
    this.user = this.authService.getUser();

    this.patientService.getMyProfile().subscribe({
      next: (response) => {
        this.patient = response.patient;
        console.log('Patient profile:', this.patient);
      },

      error: (error) => {
        console.log('Patient profile not found:', error);
      },
    });
  }
  toggleEdit() {
    this.editMode = !this.editMode;
  }
}
