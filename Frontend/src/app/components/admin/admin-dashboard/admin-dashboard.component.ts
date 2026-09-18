import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';

import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';

import { AdminStatsService } from '../../../services/admin-stats.service';

interface OverviewCard {
  label: string;
  value: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private adminStatsService = inject(AdminStatsService);
  private cdr = inject(ChangeDetectorRef);

  overview: OverviewCard[] = [
    {
      label: 'Total Patients',
      value: '—',
    },
    {
      label: 'Total Doctors',
      value: '—',
    },
    {
      label: 'Appointments Today',
      value: '—',
    },
    {
      label: 'Pending Appointments',
      value: '—',
    },
  ];

  sections = [
    {
      title: 'Doctors',
      desc: 'Add, edit, remove doctors.',
      link: '/admin/doctors',
    },
    {
      title: 'Patients',
      desc: 'View and manage patient records.',
      link: '/admin/patients',
    },
    {
      title: 'Departments',
      desc: 'Add, edit, remove departments.',
      link: '/admin/departments',
    },
    {
      title: 'Appointments',
      desc: 'Confirm, cancel, update status.',
      link: '/admin/appointments',
    },
    {
      title: 'Users & Roles',
      desc: 'Manage accounts and role assignment.',
      link: '/admin/users',
    },
    {
      title: 'Audit Logs',
      desc: 'Track every admin action.',
      link: '/admin/audit-logs',
    },
    {
      title: 'Payments',
      desc: 'Review payment history and invoices.',
      link: '/admin/payments',
    },
    {
      title: 'Medicine',
      desc: 'Pharmacy / inventory management.',
      link: '/admin/medicine',
      owner: 'Person 3',
    },
  ];

  ngOnInit(): void {
    this.adminStatsService.getStats().subscribe({
      next: (stats) => {
        console.log('ADMIN STATS:', stats);

        this.overview = [
          {
            label: 'Total Patients',
            value: stats.totalPatients.toString(),
          },
          {
            label: 'Total Doctors',
            value: stats.totalDoctors.toString(),
          },
          {
            label: 'Appointments Today',
            value: stats.appointmentsToday.toString(),
          },
          {
            label: 'Pending Appointments',
            value: stats.pendingAppointments.toString(),
          },
        ];

        // Force Angular to update the UI
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error('Failed to load admin stats:', err);
      },
    });
  }
}
