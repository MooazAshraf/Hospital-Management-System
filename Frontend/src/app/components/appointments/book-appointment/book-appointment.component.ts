import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  ActivatedRoute,
  Router,
  RouterLink,
} from '@angular/router';

import { DoctorService } from '../../../services/doctor.service';
import { Doctor } from '../../../models/doctor.model';

import { BookingStepsComponent } from '../booking-steps/booking-steps.component';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';


@Component({
  selector: 'app-book-appointment',

  standalone: true,

  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    BookingStepsComponent,
    ImagePathPipe,
  ],

  templateUrl: './book-appointment.component.html',
})
export class BookAppointmentComponent implements OnInit {

  private readonly doctorService =
    inject(DoctorService);

  private readonly route =
    inject(ActivatedRoute);

  private readonly router =
    inject(Router);


  readonly doctors =
    signal<Doctor[]>([]);

  readonly isLoading =
    signal(false);

  readonly errorMessage =
    signal('');

  readonly selectedDoctor =
    signal<Doctor | null>(null);

  readonly searchTerm =
    signal('');

  readonly selectedDepartment =
    signal('');


  readonly failedImages =
    signal<Set<string>>(new Set());


  /* =========================================
     الأقسام
  ========================================= */

  readonly departments = computed(() => {

    const names = this.doctors()
      .map((doctor) =>
        this.departmentName(doctor)
      )
      .filter(
        (name) =>
          name &&
          name !== 'N/A'
      );

    return Array.from(
      new Set(names)
    ).sort();
  });


  /* =========================================
     الأطباء بعد التصفية
  ========================================= */

  readonly filteredDoctors = computed(() => {

    const term =
      this.searchTerm()
        .trim()
        .toLowerCase();

    const department =
      this.selectedDepartment();

    let list =
      this.doctors();


    if (department) {

      list = list.filter(
        (doctor) =>
          this.departmentName(doctor) ===
          department
      );
    }


    if (!term) {
      return list;
    }


    return list.filter((doctor) => {

      const doctorName =
        doctor.name?.toLowerCase() || '';

      const specialty =
        doctor.specialty?.toLowerCase() || '';

      const departmentName =
        this.departmentName(doctor)
          .toLowerCase();

      return (
        doctorName.includes(term) ||
        specialty.includes(term) ||
        departmentName.includes(term)
      );
    });

  });


  /* =========================================
     التهيئة
  ========================================= */

  ngOnInit(): void {

    const preselectedId =
      this.route.snapshot
        .queryParamMap
        .get('doctorId');

    this.fetchDoctors(
      preselectedId
    );
  }


  /* =========================================
     جلب الأطباء
  ========================================= */

  fetchDoctors(
    preselectedId: string | null = null
  ): void {

    this.isLoading.set(true);

    this.errorMessage.set('');


    this.doctorService
      .getDoctors()
      .subscribe({

        next: (doctors) => {

          this.doctors.set(doctors);

          this.isLoading.set(false);


          if (!preselectedId) {
            return;
          }


          const doctor =
            doctors.find(
              (item) =>
                item._id ===
                preselectedId
            );


          if (doctor) {

            this.selectedDoctor.set(
              doctor
            );

            return;
          }


          this.doctorService
            .getDoctorById(
              preselectedId
            )
            .subscribe({

              next: (doctor) => {

                this.selectedDoctor.set(
                  doctor
                );
              },

              error: () => {

                this.errorMessage.set(
                  'لم يتم العثور على الطبيب.'
                );
              },

            });

        },


        error: (err) => {

          this.isLoading.set(false);

          this.errorMessage.set(
            err?.error?.message ||
            'تعذر تحميل الأطباء. يرجى المحاولة مرة أخرى.'
          );

        },

      });
  }


  /* =========================================
     اختيار الطبيب
  ========================================= */

  selectDoctor(
    doctor: Doctor
  ): void {

    this.selectedDoctor.set(
      doctor
    );
  }


  /* =========================================
     تغيير الطبيب
  ========================================= */

  changeDoctor(): void {

    this.selectedDoctor.set(null);

    this.router.navigate([
      '/book-appointment',
    ]);

  }


  /* =========================================
     تم الحجز
  ========================================= */

  onBooked(
    appointmentId: string
  ): void {

    this.router.navigate([
      '/patient-dashboard',
    ]);

  }


  /* =========================================
     خطأ في الصورة
  ========================================= */

  onImageError(
    doctorId: string
  ): void {

    const current =
      new Set(
        this.failedImages()
      );

    current.add(doctorId);

    this.failedImages.set(
      current
    );
  }


  /* =========================================
     الاسم العربي
  ========================================= */

  isArabicName(
    name: string
  ): boolean {

    return /[\u0600-\u06FF]/.test(
      name || ''
    );
  }


  /* =========================================
     اسم القسم
  ========================================= */

  departmentName(
    doctor: Doctor
  ): string {

    const department =
      doctor?.department;


    if (
      department &&
      typeof department === 'object'
    ) {

      return (
        (department as any).name ||
        'غير محدد'
      );
    }


    if (
      typeof department === 'string'
    ) {

      return department;
    }


    return 'غير محدد';
  }

}