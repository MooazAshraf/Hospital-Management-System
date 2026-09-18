import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

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

  contactForm: FormGroup;

  isSubmitting = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder
  ) {

    this.contactForm = this.fb.group({

      name: [
        '',
        Validators.required,
      ],

      email: [
        '',
        [
          Validators.required,
          Validators.email,
        ],
      ],

      phone: [
        '',
        [
          Validators.pattern(/^01[0125][0-9]{8}$/),
        ],
      ],

      subject: [
        '',
        Validators.required,
      ],

      message: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
        ],
      ],

    });

  }


  submitForm(): void {

    this.successMessage = '';

    if (this.contactForm.invalid) {

      this.contactForm.markAllAsTouched();

      return;
    }

    this.isSubmitting = true;

    // مؤقتًا لحد ما نعمل Backend للـ Contact
    setTimeout(() => {

      console.log(
        'Contact form:',
        this.contactForm.value
      );

      this.isSubmitting = false;

      this.successMessage =
        'Your message has been sent successfully. We will get back to you soon.';

      this.contactForm.reset();

    }, 800);

  }

}