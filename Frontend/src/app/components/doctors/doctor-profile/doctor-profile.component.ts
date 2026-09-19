import {
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  RouterLink,
} from '@angular/router';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ImagePathPipe,
  ],
  templateUrl: './doctor-profile.component.html',
})
export class DoctorProfileComponent
  implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly doctorService =
    inject(DoctorService);

  readonly doctor =
    signal<Doctor | null>(null);

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal('');


  get departmentName(): string {
    const dept =
      this.doctor()?.department;

    return dept &&
      typeof dept === 'object'
      ? dept.name
      : 'N/A';
  }


  get isArabicName(): boolean {
    return /[\u0600-\u06FF]/.test(
      this.doctor()?.name || ''
    );
  }


  ngOnInit(): void {
    const id =
      this.route.snapshot.paramMap.get(
        'id'
      );

    if (!id) {
      this.errorMessage.set(
        'لم يتم العثور على الطبيب.'
      );
      return;
    }

    this.isLoading.set(true);

    this.doctorService
      .getDoctorById(id)
      .subscribe({
        next: (doctor) => {
          this.doctor.set(doctor);
          this.isLoading.set(false);
        },

        error: () => {
          this.errorMessage.set(
            'تعذر تحميل بيانات الطبيب. يرجى المحاولة مرة أخرى.'
          );

          this.isLoading.set(false);
        },
      });
  }
}