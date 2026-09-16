import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Stat { value: string; label: string; }

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats.component.html'
})
export class StatsComponent {
  stats: Stat[] = [
    { value: '12', label: 'Years serving Cairo' },
    { value: '28', label: 'Practicing doctors' },
    { value: '9,400+', label: 'Patients cared for' },
    { value: '9', label: 'Departments' }
  ];
}
