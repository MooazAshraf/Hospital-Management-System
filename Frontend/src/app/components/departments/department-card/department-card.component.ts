import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';
import { Department } from '../../../models';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ImagePathPipe],
  templateUrl: './department-card.component.html',
})
export class DepartmentCardComponent {
  @Input({ required: true }) department!: Department;
}
