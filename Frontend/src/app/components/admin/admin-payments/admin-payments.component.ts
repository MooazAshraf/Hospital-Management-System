import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentService } from '../../../services/payment.service';
import { Payment } from '../../../models/payment.model';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.component.html',
})
export class AdminPaymentsComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  payments: Payment[] = [];
  loading = false;
  errorMessage = '';
  savingId = '';

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.paymentService.getPayments().subscribe({
      next: (res) => { this.payments = res.data || []; this.loading = false; },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to load payments'; this.loading = false; },
    });
  }

  setStatus(payment: Payment, status: Payment['status']): void {
    this.savingId = payment._id;
    this.paymentService.updatePayment(payment._id, { status }).subscribe({
      next: () => { this.savingId = ''; this.load(); },
      error: (err) => { this.errorMessage = err?.error?.message || 'Failed to update payment'; this.savingId = ''; },
    });
  }
}
