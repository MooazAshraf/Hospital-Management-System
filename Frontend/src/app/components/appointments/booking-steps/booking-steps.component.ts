import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  signal,
  computed,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  CommonModule,
} from '@angular/common';
import { ImagePathPipe } from '../../../pipes/image-path.pipe';

import {
  HttpClient,
} from '@angular/common/http';

interface Slot {
  time: string;
  booked: boolean;
}

@Component({
  selector: 'app-booking-steps',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
      ImagePathPipe,
  ],
  templateUrl:
    './booking-steps.component.html',
})
export class BookingStepsComponent
  implements OnInit {

  @Input() doctorId = '';

  @Input() doctorName = '';

  @Input() doctorImage = '';

  @Input() doctorSpecialty = '';

  @Input() doctorFees: number | null = null;

  @Output() booked =
    new EventEmitter<string>();

  detailsForm: FormGroup;

  step = signal(1);

  submitting = signal(false);

  loadingSlots = signal(false);

  errorMessage = signal('');

  availableSlots =
    signal<Slot[]>([]);

  stepLabels = [
    'Patient',
    'Appointment',
    'Details',
    'Confirm',
  ];

  minDate = '';

  morningSlots = computed(() =>
    this.availableSlots().filter(
      (slot) => {
        const hour =
          Number(
            slot.time.split(':')[0]
          );

        return hour < 12;
      }
    )
  );

  afternoonSlots = computed(() =>
    this.availableSlots().filter(
      (slot) => {
        const hour =
          Number(
            slot.time.split(':')[0]
          );

        return hour >= 12;
      }
    )
  );

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.detailsForm =
      this.fb.group({
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

  ngOnInit(): void {
    const today = new Date();

    this.minDate =
      this.formatDate(today);

    this.detailsForm
      .get('date')
      ?.valueChanges
      .subscribe((date) => {
        if (date) {
          this.loadSlots(date);
        }
      });
  }

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
  // Load Available Slots
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

    const url =
      'http://localhost:5000/api/appointments/available-slots';

    const params = {
      doctor: this.doctorId,
      date,
    };

    this.http
      .get<any>(url, { params })
      .subscribe({
        next: (res) => {
          console.log(
            'Available slots:',
            res
          );

          const availableTimes =
            res?.data?.availableTimes ??
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

          this.loadingSlots.set(
            false
          );

          if (
            availableTimes.length === 0
          ) {
            this.errorMessage.set(
              'لا توجد مواعيد متاحة لهذا اليوم.'
            );
          }
        },

        error: (error) => {
          console.error(
            'Available slots error:',
            error
          );

          this.availableSlots.set([]);

          this.loadingSlots.set(
            false
          );

          this.errorMessage.set(
            error?.error?.message ||
            'حدث خطأ أثناء تحميل المواعيد المتاحة.'
          );
        },
      });
  }

  // =====================================================
  // Date
  // =====================================================

  onDateChosen(
    date: string
  ): void {
    this.detailsForm.patchValue({
      date,
      time: '',
    });

    this.step.set(2);

    this.loadSlots(date);
  }

  // =====================================================
  // Choose Time
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

  slotTitle(
    slot: Slot
  ): string {
    return slot.booked
      ? 'هذا الموعد محجوز'
      : 'اختيار هذا الموعد';
  }

  hasAnyAvailableSlot(): boolean {
    return this.availableSlots().some(
      (slot) => !slot.booked
    );
  }

  // =====================================================
  // Review
  // =====================================================

  goToReview(): void {
    const appointmentType =
      this.detailsForm.get(
        'appointmentType'
      );

    if (
      appointmentType?.invalid
    ) {
      appointmentType.markAsTouched();
      return;
    }

    this.step.set(4);
  }

  // =====================================================
  // Back
  // =====================================================

  back(): void {
    if (this.step() > 1) {
      this.step.update(
        (value) => value - 1
      );
    }
  }

  // =====================================================
  // Confirm
  // =====================================================

  confirm(): void {
    this.errorMessage.set('');

    if (
      this.detailsForm.invalid
    ) {
      this.detailsForm.markAllAsTouched();

      this.errorMessage.set(
        'من فضلك املأ جميع البيانات المطلوبة.'
      );

      return;
    }

    if (!this.doctorId) {
      this.errorMessage.set(
        'بيانات الطبيب غير موجودة.'
      );

      return;
    }

    this.submitting.set(true);

    const formValue =
      this.detailsForm.getRawValue();

    const payload = {
      doctor: this.doctorId,

      patientName:
        formValue.patientName,

      phone:
        formValue.phone,

      email:
        formValue.email,

      date:
        formValue.date,

      time:
        formValue.time,

      appointmentType:
        formValue.appointmentType,

      notes:
        formValue.notes || '',
    };

    this.http
      .post<any>(
        'http://localhost:5000/api/appointments',
        payload
      )
      .subscribe({
        next: (res) => {
          this.submitting.set(false);

          const appointmentId =
            res?.data?._id ||
            res?.appointment?._id ||
            res?._id ||
            '';

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

          this.errorMessage.set(
            error?.error?.message ||
            'حدث خطأ أثناء حجز الموعد.'
          );
        },
      });
  }
}