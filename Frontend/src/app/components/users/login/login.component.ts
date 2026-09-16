// TODO(Person 1): reactive form + AuthService.login() -> POST /api/users/login, store JWT.
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserServices } from '../../../services/users.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loading = false;
  errorMessage = '';
  form: FormGroup;
  constructor(
    private fb: FormBuilder,
    private usersService: UserServices,
    private router: Router,
    private authService: AuthService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }
  get f() {
    return this.form.controls;
  }
  onSubmit() {
    this.errorMessage = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    const { email, password } = this.form.value;
    this.usersService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false; 
        // Save token
        this.authService.login(response.token, response.user);
        // Go to home
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.message || 'Invalid email or password.';
      },
    });
  }
}