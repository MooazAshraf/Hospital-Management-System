import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Payment } from '../../../models/payment.model';
import { PaymentService } from '../../../services/payment.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html'
})
export class PaymentHistoryComponent implements OnInit {

  payments: Payment[] = [];

  constructor(private paymentService: PaymentService) { }

  ngOnInit(): void {
    this.paymentService.getPayments().subscribe({
      next: (response) => {
        this.payments = response.data;
      },
      error: (error) => {
        console.error('Error fetching payments:', error);
      }
    });
  }
}
