import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-form.component.html'
})
export class PaymentFormComponent {

  form: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService
  ) {
    this.form = this.fb.group({
      appointment: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0)]],
      method: ['', Validators.required],
      transactionId: ['', Validators.required],
      senderPhone: [''],
      instapayUsername: ['']
    });
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.paymentService.createPayment(this.form.value).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Payment created successfully.';
        this.form.reset();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'Payment failed. Please try again.';
      }
    });
  }
}
