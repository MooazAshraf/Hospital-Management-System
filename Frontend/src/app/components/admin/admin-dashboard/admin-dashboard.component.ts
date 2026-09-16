import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

interface OverviewCard {
  label: string;
  value: string;
}

// TODO: this page just links out to each management area — the real CRUD
// tables live in their own collection folders (doctors/, patients/,
// departments/, appointments/, users/, audit-logs/). Wire the 4 overview
// numbers below to real counts once each service has a getCount() endpoint:
// Total Patients -> GET /api/patients/count      (Person 1)
// Total Doctors  -> GET /api/doctors/count        (Person 1)
// Appts Today    -> GET /api/appointments/count?date=today   (Person 5)
// Pending Appts  -> GET /api/appointments/count?status=pending (Person 5)
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent {
  overview: OverviewCard[] = [
    { label: 'Total Patients', value: '—' },
    { label: 'Total Doctors', value: '—' },
    { label: 'Appointments Today', value: '—' },
    { label: 'Pending Appointments', value: '—' },
  ];

  sections = [
    {
      title: 'Doctors',
      desc: 'Add, edit, remove doctors.',
      link: '/admin/doctors',
      owner: 'Person 1',
    },
    {
      title: 'Patients',
      desc: 'View and manage patient records.',
      link: '/admin/patients',
      owner: 'Person 1',
    },
    {
      title: 'Departments',
      desc: 'Add, edit, remove departments.',
      link: '/admin/departments',
      owner: 'Person 2',
    },
    {
      title: 'Appointments',
      desc: 'Confirm, cancel, update status.',
      link: '/admin/appointments',
      owner: 'Person 5',
    },
    {
      title: 'Users & Roles',
      desc: 'Manage accounts and role assignment.',
      link: '/admin/users',
      owner: 'Person 1',
    },
    {
      title: 'Audit Logs',
      desc: 'Track every admin action.',
      link: '/admin/audit-logs',
      owner: 'Person 2',
    },
    {
      title: 'Payments',
      desc: 'Review payment history and invoices.',
      link: '/admin/payments',
      owner: 'Person 4',
    },
    {
      title: 'Medicine',
      desc: 'Pharmacy / inventory management.',
      link: '/admin/medicine',
      owner: 'Person 3',
    },
  ];
}
