import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Doctor } from '../../models';

@Component({
  selector: 'app-doctor-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './doctor-card.component.html'
})
export class DoctorCardComponent {
  @Input({ required: true }) doctor!: Doctor;
}
