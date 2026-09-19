import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  signal,
  computed,
  inject,
  OnDestroy,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { CommonModule } from '@angular/common';

import {
  HttpClient,
  HttpParams,
} from '@angular/common/http';

import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil,
} from 'rxjs';

import { AuthService } from '../../../services/auth.service';


interface Slot {
  time: string;
  booked: boolean;
}


interface AvailableSlotsResponse {
  success: boolean;
  message?: string;

  data?: {
    availableTimes?: string[];
  };

  availableTimes?: string[];

  slots?: string[];

  availableSlots?: string[];
}


@Component({
  selector: 'app-booking-steps',
  standalone: true,

  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImagePathPipe,
  ],

  templateUrl: './booking-steps.component.html',
})
export class BookingStepsComponent
  implements OnInit, OnDestroy {

  @Input() doctorId = '';
  @Input() doctorName = '';
  @Input() doctorImage = '';
  @Input() doctorSpecialty = '';
  @Input() doctorFees: number | null = null;

  @Output() booked = new EventEmitter<string>();


  private readonly fb =
    inject(FormBuilder);

  private readonly http =
    inject(HttpClient);

  private readonly authService =
    inject(AuthService);

  private readonly destroy$ =
    new Subject<void>();


  detailsForm: FormGroup;


  step = signal(1);

  submitting = signal(false);

  loadingSlots = signal(false);

  errorMessage = signal('');

  availableSlots =
    signal<Slot[]>([]);


  stepLabels = [
    'المريض',
    'الموعد',
    'التفاصيل',
    'التأكيد',
  ];


  minDate = '';


  morningSlots = computed(() =>
    this.availableSlots().filter((slot) => {

      const hour = Number(
        slot.time.split(':')[0]
      );

      return hour < 12;
    })
  );


  afternoonSlots = computed(() =>
    this.availableSlots().filter((slot) => {

      const hour = Number(
        slot.time.split(':')[0]
      );

      return hour >= 12;
    })
  );


  constructor() {

    this.detailsForm = this.fb.group({

      patientName: [
        '',
        Validators.required,
      ],

      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^01[0125][0-9]{8}$/
          ),
        ],
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      date: [
        '',
        Validators.required,
      ],

      time: [
        '',
        Validators.required,
      ],

      appointmentType: [
        'Check-up',
        Validators.required,
      ],

      notes: [''],
    });
  }


  // =====================================================
  // التهيئة
  // =====================================================

  ngOnInit(): void {

    const today = new Date();

    this.minDate =
      this.formatDate(today);


    const currentUser =
      this.authService.getUser();


    if (!currentUser) {

      this.errorMessage.set(
        'يجب تسجيل الدخول أولاً لحجز موعد.'
      );

      return;
    }


    // -------------------------------------------------
    // بيانات المستخدم المسجل
    // -------------------------------------------------

    this.detailsForm.patchValue({

      patientName:
        (currentUser as any).name ||
        (currentUser as any).fullName ||
        '',

      phone:
        (currentUser as any).phone ||
        '',

      email:
        (currentUser as any).email ||
        '',
    });


    // -------------------------------------------------
    // تغيير التاريخ
    // -------------------------------------------------

    this.detailsForm
      .get('date')
      ?.valueChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((date: string) => {

        this.detailsForm.patchValue(
          {
            time: '',
          },
          {
            emitEvent: false,
          }
        );


        if (
          date &&
          date.length === 10
        ) {

          this.loadSlots(date);

        } else {

          this.availableSlots.set([]);

        }

      });
  }


  // =====================================================
  // إنهاء المكون
  // =====================================================

  ngOnDestroy(): void {

    this.destroy$.next();

    this.destroy$.complete();
  }


  // =====================================================
  // تنسيق التاريخ
  // =====================================================

  private formatDate(
    date: Date
  ): string {

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        date.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }


  // =====================================================
  // تحميل المواعيد المتاحة
  // =====================================================

  loadSlots(
    date: string
  ): void {

    if (
      !this.doctorId ||
      !date
    ) {

      this.availableSlots.set([]);

      return;
    }


    this.loadingSlots.set(true);

    this.errorMessage.set('');

    this.availableSlots.set([]);


    const params =
      new HttpParams()
        .set(
          'doctor',
          this.doctorId
        )
        .set(
          'date',
          date
        );


    this.http
      .get<AvailableSlotsResponse>(
        'http://localhost:5000/api/appointments/available-slots',
        {
          params,
        }
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: (res) => {

          console.log(
            'Available slots response:',
            res
          );


          const availableTimes =
            res?.data?.availableTimes ??
            res?.availableTimes ??
            res?.availableSlots ??
            res?.slots ??
            [];


          const slots: Slot[] =
            availableTimes.map(
              (time: string) => ({
                time,
                booked: false,
              })
            );


          this.availableSlots.set(
            slots
          );


          this.loadingSlots.set(false);


          if (!slots.length) {

            this.errorMessage.set(
              'لا توجد مواعيد متاحة لهذا اليوم.'
            );

          } else {

            this.errorMessage.set('');

          }
        },


        error: (error) => {

          console.error(
            'Available slots error:',
            error
          );


          this.availableSlots.set([]);

          this.loadingSlots.set(false);


          this.errorMessage.set(
            error?.error?.message ||
            'حدث خطأ أثناء تحميل المواعيد المتاحة.'
          );

        },

      });
  }


  // =====================================================
  // اختيار التاريخ
  // =====================================================

  onDateChosen(
    date: string
  ): void {

    this.detailsForm.patchValue({
      date,
      time: '',
    });

    this.step.set(2);

    // valueChanges سيقوم بتحميل المواعيد
  }


  // =====================================================
  // اختيار الوقت
  // =====================================================

  chooseTime(
    slot: Slot
  ): void {

    if (slot.booked) {
      return;
    }


    this.detailsForm.patchValue({
      time: slot.time,
    });

    this.step.set(3);
  }


  // =====================================================
  // عنوان الموعد
  // =====================================================

  slotTitle(
    slot: Slot
  ): string {

    return slot.booked
      ? 'هذا الموعد محجوز'
      : 'اختيار هذا الموعد';
  }


  // =====================================================
  // التحقق من وجود موعد متاح
  // =====================================================

  hasAnyAvailableSlot(): boolean {

    return this.availableSlots()
      .some(
        (slot) => !slot.booked
      );
  }


  // =====================================================
  // المراجعة
  // =====================================================

  goToReview(): void {

    const appointmentType =
      this.detailsForm.get(
        'appointmentType'
      );

    const time =
      this.detailsForm.get('time');


    if (
      appointmentType?.invalid
    ) {

      appointmentType.markAsTouched();

      return;
    }


    if (time?.invalid) {

      time.markAsTouched();

      this.errorMessage.set(
        'من فضلك اختر موعدًا.'
      );

      return;
    }


    this.step.set(4);
  }


  // =====================================================
  // الرجوع
  // =====================================================

  back(): void {

    if (this.step() > 1) {

      this.step.update(
        (value) => value - 1
      );

    }
  }


  // =====================================================
  // تأكيد الحجز
  // =====================================================

  confirm(): void {

    this.errorMessage.set('');


    const currentUser =
      this.authService.getUser();


    // -------------------------------------------------
    // تسجيل الدخول
    // -------------------------------------------------

    if (!currentUser) {

      this.errorMessage.set(
        'يجب تسجيل الدخول أولاً لحجز موعد.'
      );

      return;
    }


    // -------------------------------------------------
    // الطبيب
    // -------------------------------------------------

    if (!this.doctorId) {

      this.errorMessage.set(
        'بيانات الطبيب غير موجودة.'
      );

      return;
    }


    // -------------------------------------------------
    // التحقق من النموذج
    // -------------------------------------------------

    if (
      this.detailsForm.invalid
    ) {

      this.detailsForm.markAllAsTouched();

      this.errorMessage.set(
        'من فضلك املأ جميع البيانات المطلوبة.'
      );

      return;
    }


    const formValue =
      this.detailsForm.getRawValue();


    // -------------------------------------------------
    // التحقق من الموعد المختار
    // -------------------------------------------------

    const selectedSlot =
      this.availableSlots().find(
        (slot) =>
          slot.time === formValue.time &&
          !slot.booked
      );


    if (!selectedSlot) {

      this.errorMessage.set(
        'هذا الموعد غير متاح. من فضلك اختر موعدًا آخر.'
      );


      if (formValue.date) {

        this.loadSlots(
          formValue.date
        );

      }

      return;
    }


    // -------------------------------------------------
    // منع الإرسال المتكرر
    // -------------------------------------------------

    if (this.submitting()) {
      return;
    }


    this.submitting.set(true);


    // -------------------------------------------------
    // لا يتم إرسال معرف المريض من الواجهة
    // -------------------------------------------------

    const payload = {

      doctor:
        this.doctorId,

      date:
        formValue.date,

      time:
        formValue.time,

      appointmentType:
        formValue.appointmentType,

      notes:
        formValue.notes || '',
    };


    console.log(
      'Booking payload:',
      payload
    );


    // -------------------------------------------------
    // إنشاء الموعد
    // -------------------------------------------------

    this.http
      .post<any>(
        'http://localhost:5000/api/appointments',
        payload
      )
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({

        next: (res) => {

          console.log(
            'Appointment created:',
            res
          );


          this.submitting.set(false);


          const appointmentId =
            res?.data?._id ||
            res?.appointment?._id ||
            res?._id ||
            '';


          // تحديث حالة الموعد محليًا

          this.availableSlots.update(
            (slots) =>
              slots.map(
                (slot) =>
                  slot.time ===
                    formValue.time
                    ? {
                        ...slot,
                        booked: true,
                      }
                    : slot
              )
          );


          this.booked.emit(
            appointmentId
          );
        },


        error: (error) => {

          console.error(
            'Booking error:',
            error
          );


          this.submitting.set(false);


          const message =
            error?.error?.message ||
            'حدث خطأ أثناء حجز الموعد.';


          this.errorMessage.set(
            message
          );


          // إعادة تحميل المواعيد في حالة التعارض

          if (
            error?.status === 400 ||
            error?.status === 409
          ) {

            if (
              formValue.date
            ) {

              this.loadSlots(
                formValue.date
              );

            }
          }

        },

      });
  }

}