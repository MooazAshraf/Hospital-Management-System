import {
  Component,
  Input,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterLink } from '@angular/router';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import { Doctor } from '../../../models/doctor.model';


@Component({
  selector: 'app-doctor-card',
  standalone: true,

  imports: [
    CommonModule,
    RouterLink,
    ImagePathPipe,
  ],

  templateUrl:
    './doctor-card.component.html',
})
export class DoctorCardComponent {

  @Input()
  doctor!: Doctor;


  get departmentName(): string {

    const department =
      this.doctor?.department;


    if (
      department &&
      typeof department === 'object'
    ) {
      return department.name || 'N/A';
    }


    if (
      typeof department === 'string'
    ) {
      return department;
    }


    return 'N/A';
  }

}