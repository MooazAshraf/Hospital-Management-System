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
import { AuditLogTableComponent } from './audit-logs/audit-log-table/audit-log-table.component';
import { DepartmentsListComponent } from './departments/departments-list/departments-list.component';
import { MedicineListComponent } from './medicine/medicine-list/medicine-list.component';
import { MedicalReportsListComponent } from './medical-reports/medical-reports-list/medical-reports-list.component';
import { ReviewsListComponent } from './reviews/reviews-list/reviews-list.component';
import { AdminUsersComponent } from './admin/admin-users/admin-users.component';
import { AdminPaymentsComponent } from './admin/admin-payments/admin-payments.component';
import { AdminDepartmentsComponent } from './admin/admin-departments/admin-departments.component';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },

  { path: 'doctors', component: DoctorsListComponent },
  { path: 'doctors/:id', component: DoctorProfileComponent },

  { path: 'departments', component: DepartmentsListComponent },
  { path: 'reviews', component: ReviewsListComponent },

  { path: 'book-appointment', component: BookAppointmentComponent, canActivate: [authGuard, roleGuard(['user'])] },
  { path: 'payment', component: PaymentFormComponent, canActivate: [authGuard, roleGuard(['user'])] },
  { path: 'payments', component: PaymentHistoryComponent, canActivate: [authGuard, roleGuard(['user', 'admin'])] },

  { path: 'patient-dashboard', component: PatientDashboardComponent, canActivate: [authGuard, roleGuard(['user'])] },
  { path: 'doctor-dashboard', component: DoctorDashboardComponent, canActivate: [authGuard, roleGuard(['doctor'])] },

  { path: 'medicines', component: MedicineListComponent, canActivate: [authGuard] },
  { path: 'medical-reports', component: MedicalReportsListComponent, canActivate: [authGuard] },

  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/patients', component: PatientListComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/doctors', component: AdminDoctorsComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/appointments', component: AdminAppointmentsComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/medicine', component: MedicineListComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/medical-reports', component: MedicalReportsListComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/payments', component: AdminPaymentsComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/audit-logs', component: AuditLogTableComponent, canActivate: [authGuard, roleGuard(['admin'])] },
  { path: 'admin/departments', component: AdminDepartmentsComponent, canActivate: [authGuard, roleGuard(['admin'])] },

  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent },

  { path: '**', redirectTo: '' },
];