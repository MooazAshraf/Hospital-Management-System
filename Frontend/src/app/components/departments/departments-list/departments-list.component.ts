import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentCardComponent } from '../department-card/department-card.component';
import { Department } from '../../models';

@Component({
  selector: 'app-departments-list',
  standalone: true,
  imports: [CommonModule, DepartmentCardComponent],
  templateUrl: './departments-list.component.html'
})
export class DepartmentsListComponent {
  // TODO(Person 2): replace with DepartmentsService.getAll() -> GET /api/departments
  departments: Department[] = [
    { name: 'Cardiology', description: 'Heart screening, rhythm disorders, and long-term cardiac care.', doctorsCount: 4 },
    { name: 'Pediatrics', description: 'Newborn checkups through adolescent care in a calm setting.', doctorsCount: 5 },
    { name: 'Orthopedics', description: 'Joint, bone, and sports injury diagnosis and rehabilitation.', doctorsCount: 3 },
    { name: 'Dermatology', description: 'Skin conditions, allergy testing, and cosmetic dermatology.', doctorsCount: 2 },
    { name: 'Neurology', description: 'Headache, stroke follow-up, and nervous system disorders.', doctorsCount: 3 },
    { name: 'General Medicine', description: 'Everyday illness, checkups, and referrals to specialists.', doctorsCount: 6 }
  ];
}
