import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';

import { LoginComponent } from './users/login/login.component';
import { RegisterComponent } from './users/register/register.component';
import { ProfileComponent } from './users/profile/profile.component';

import { DoctorsListComponent } from './doctors/doctors-list/doctors-list.component';
import { DoctorProfileComponent } from './doctors/doctor-profile/doctor-profile.component';

import { BookAppointmentComponent } from './appointments/book-appointment/book-appointment.component';

import { PaymentFormComponent } from './payments/payment-form/payment-form.component';

import { PatientDashboardComponent } from './patients/patient-dashboard/patient-dashboard.component';

import { DoctorDashboardComponent } from './doctors/doctor-dashboard/doctor-dashboard.component';

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },

  {
    path: 'home',
    component: HomeComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },

  {
    path: 'register',
    component: RegisterComponent
  },

  {
    path: 'profile',
    component: ProfileComponent
  },

  {
    path: 'doctors',
    component: DoctorsListComponent
  },

  {
    path: 'doctors/:id',
    component: DoctorProfileComponent
  },

  {
    path: 'book-appointment',
    component: BookAppointmentComponent
  },

  {
    path: 'payment',
    component: PaymentFormComponent
  },

  {
    path: 'patient-dashboard',
    component: PatientDashboardComponent
  },

  {
    path: 'doctor-dashboard',
    component: DoctorDashboardComponent
  },

  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent
  },

  {
    path: 'about',
    component: AboutComponent
  },

  {
    path: 'contact',
    component: ContactComponent
  },

  {
    path: '**',
    redirectTo: ''
  }
];