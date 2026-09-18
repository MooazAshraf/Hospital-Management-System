import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './users/login/login.component';
import { RegisterComponent } from './users/register/register.component';
import { ProfileComponent } from './users/profile/profile.component';
import { BookAppointmentComponent } from './appointments/book-appointment/book-appointment.component';
import { PaymentFormComponent } from './payments/payment-form/payment-form.component';
import { PatientDashboardComponent } from './patients/patient-dashboard/patient-dashboard.component';
import { PatientListComponent } from './patients/patient-list/patient-list.component';
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
  
  // Dashboard المريض
  { path: 'dashboard', component: PatientDashboardComponent },
  
  // جدول إدارة المرضى الخاص بالـ Admin
  { path: 'admin/patients', component: PatientListComponent },
  
  { path: 'doctor-dashboard', component: DoctorDashboardComponent },
  { path: 'admin', component: AdminDashboardComponent },
  { path: '**', redirectTo: '' },
];