import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ContactService } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.component.html',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService =
    inject(ContactService);

  isLoading = false;

  successMessage = '';

  errorMessage = '';

  contactForm = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.maxLength(100),
      ],
    ],

    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150),
      ],
    ],

    phone: [
      '',
      [
        Validators.maxLength(30),
      ],
    ],

    subject: [
      '',
      [
        Validators.required,
        Validators.maxLength(200),
      ],
    ],

    message: [
      '',
      [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(2000),
      ],
    ],
  });

  get name() {
    return this.contactForm.get('name');
  }

  get email() {
    return this.contactForm.get('email');
  }

  get phone() {
    return this.contactForm.get('phone');
  }

  get subject() {
    return this.contactForm.get('subject');
  }

  get message() {
    return this.contactForm.get('message');
  }

  sendMessage(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const formData =
      this.contactForm.getRawValue();

    this.contactService
      .sendMessage(formData)
      .subscribe({
        next: (response) => {
          this.isLoading = false;

          this.successMessage =
            response.message ||
            'Your message has been sent successfully.';

          this.contactForm.reset({
            name: '',
            email: '',
            phone: '',
            subject: '',
            message: '',
          });
        },

        error: (error) => {
          this.isLoading = false;

          console.error(
            'Contact message error:',
            error
          );

          this.errorMessage =
            error?.error?.message ||
            'Failed to send your message. Please try again.';
        },
      });
  }
}