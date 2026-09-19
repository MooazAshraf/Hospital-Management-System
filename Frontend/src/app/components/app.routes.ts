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
import { PaymentHistoryComponent } from './payments/payment-history/payment-history.component';

import { PatientDashboardComponent } from './patients/patient-dashboard/patient-dashboard.component';
import { DoctorDashboardComponent } from './doctors/doctor-dashboard/doctor-dashboard.component';

import { AdminDashboardComponent } from './admin/admin-dashboard/admin-dashboard.component';
import { PatientListComponent } from './patients/patient-list/patient-list.component';
import { AdminDoctorsComponent } from './admin/admin-doctors-list/admin-doctors-list.component';
import { AdminAppointmentsComponent } from './admin/admin-appoinment/admin-appointments.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';

import { DepartmentsListComponent } from './departments/departments-list/departments-list.component';
import { AdminDepartmentsComponent } from './admin/admin-departments/admin-departments.component';
import { MedicineListComponent } from './medicine/medicine-list/medicine-list.component';
import { MedicalReportsListComponent } from './medical-reports/medical-reports-list/medical-reports-list.component';
import { ReviewsListComponent } from './reviews/reviews-list/reviews-list.component';
import { AuditLogTableComponent } from './audit-logs/audit-log-table/audit-log-table.component';

import { authGuard, roleGuard } from './guards/auth.guard';
import { DepartmentDetailsComponent } from './departments/department-details/department-details.component';
export const routes: Routes = [
  // =========================
  // PUBLIC ROUTES
  // =========================

  {
    path: '',
    component: HomeComponent,
  },

  {
    path: 'home',
    component: HomeComponent,
  },

  {
    path: 'login',
    component: LoginComponent,
  },

  {
    path: 'register',
    component: RegisterComponent,
  },

  {
    path: 'about',
    component: AboutComponent,
  },

  {
    path: 'contact',
    component: ContactComponent,
  },

  {
    path: 'doctors',
    component: DoctorsListComponent,
  },

  {
    path: 'doctors/:id',
    component: DoctorProfileComponent,
  },

  { path: 'departments', component: DepartmentsListComponent },

  { path: 'departments/:id', component: DepartmentDetailsComponent },

  {
    path: 'medicines',
    component: MedicineListComponent,
  },

  {
    path: 'medical-reports',
    component: MedicalReportsListComponent,
  },

  {
    path: 'reviews',
    component: ReviewsListComponent,
  },

  // =========================
  // LOGGED-IN USER ROUTES
  // =========================

<<<<<<< HEAD
  { path: '**', redirectTo: '' },
];
=======
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },

  {
    path: 'book-appointment',
    component: BookAppointmentComponent,
    canActivate: [authGuard, roleGuard(['user'])],
  },

  {
    path: 'payment',
    component: PaymentFormComponent,
    canActivate: [authGuard, roleGuard(['user'])],
  },

  {
    path: 'payments/history',
    component: PaymentHistoryComponent,
    canActivate: [authGuard, roleGuard(['user'])],
  },

  // =========================
  // PATIENT
  // =========================

  {
    path: 'patient-dashboard',
    component: PatientDashboardComponent,
    canActivate: [authGuard, roleGuard(['user'])],
  },

  // =========================
  // DOCTOR
  // =========================

  {
    path: 'doctor-dashboard',
    component: DoctorDashboardComponent,
    canActivate: [authGuard, roleGuard(['doctor'])],
  },

  // =========================
  // ADMIN
  // =========================

  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/patients',
    component: PatientListComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/doctors',
    component: AdminDoctorsComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/appointments',
    component: AdminAppointmentsComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/users',
    component: AdminUsersComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    // تم التصحيح: كان بيودي لـ DepartmentsListComponent (العام) بدل صفحة الأدمن
    path: 'admin/departments',
    component: AdminDepartmentsComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/medicine',
    component: MedicineListComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/payments',
    component: PaymentHistoryComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  {
    path: 'admin/audit-logs',
    component: AuditLogTableComponent,
    canActivate: [authGuard, roleGuard(['admin'])],
  },

  // =========================
  // NOT FOUND
  // =========================

  {
    path: '**',
    redirectTo: '',
  },
];
>>>>>>> fd9fee81fadad1e6281dc26b3c0f08f832043ea1
