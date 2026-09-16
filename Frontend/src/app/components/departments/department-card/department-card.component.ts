import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Department } from '../../models';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './department-card.component.html'
})
export class DepartmentCardComponent {
  @Input({ required: true }) department!: Department;
}
