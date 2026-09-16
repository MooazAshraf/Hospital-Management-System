import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Highlight { title: string; desc: string; }

@Component({
  selector: 'app-highlights',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './highlights.component.html'
})
export class HighlightsComponent {
  highlights: Highlight[] = [
    { title: 'Emergency care', desc: 'Round-the-clock emergency department with rapid triage.' },
    { title: 'Qualified doctors', desc: '28 specialists across 9 departments, most trained abroad.' },
    { title: 'Modern facilities', desc: 'On-site imaging, laboratory, and pharmacy under one roof.' },
    { title: '9 specialized departments', desc: 'From cardiology to pediatrics, coordinated under one file.' }
  ];
}
