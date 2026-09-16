import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './users/login/login.component';
import { RegisterComponent } from './users/register/register.component';
import { ProfileComponent } from './users/profile/profile.component';
import { BookAppointmentComponent } from './appointments/book-appointment/book-appointment.component';
import { PaymentFormComponent } from './payments/payment-form/payment-form.component';
import { PatientDashboardComponent } from './patients/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './doctors/doctor-dashboard/doctor-dashboard.component';
import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'book-appointment', component: BookAppointmentComponent },
  { path: 'payment', component: PaymentFormComponent },
  { path: 'dashboard', component: PatientDashboardComponent },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' },
];
