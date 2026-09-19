import {
  Component,
  OnInit,
  inject,
  ChangeDetectorRef,
} from '@angular/core';

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
      label: 'إجمالي المرضى',
      value: '—',
    },
    {
      label: 'إجمالي الأطباء',
      value: '—',
    },
    {
      label: 'مواعيد اليوم',
      value: '—',
    },
    {
      label: 'المواعيد قيد الانتظار',
      value: '—',
    },
  ];

  sections = [
    {
      title: 'الأطباء',
      desc: 'إضافة الأطباء وتعديلهم وحذفهم.',
      link: '/admin/doctors',
    },
    {
      title: 'المرضى',
      desc: 'عرض وإدارة سجلات المرضى.',
      link: '/admin/patients',
    },
    {
      title: 'الأقسام',
      desc: 'إضافة الأقسام وتعديلها وحذفها.',
      link: '/admin/departments',
    },
    {
      title: 'المواعيد',
      desc: 'تأكيد المواعيد وإلغاؤها وتحديث حالتها.',
      link: '/admin/appointments',
    },
    {
      title: 'المستخدمون والصلاحيات',
      desc: 'إدارة الحسابات وتعيين الصلاحيات.',
      link: '/admin/users',
    },
    {
      title: 'سجلات التدقيق',
      desc: 'متابعة جميع إجراءات المسؤول.',
      link: '/admin/audit-logs',
    },
    {
      title: 'المدفوعات',
      desc: 'مراجعة سجل المدفوعات والفواتير.',
      link: '/admin/payments',
    },
    {
      title: 'الأدوية',
      desc: 'إدارة الصيدلية والمخزون.',
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
            label: 'إجمالي المرضى',
            value: stats.totalPatients.toString(),
          },
          {
            label: 'إجمالي الأطباء',
            value: stats.totalDoctors.toString(),
          },
          {
            label: 'مواعيد اليوم',
            value: stats.appointmentsToday.toString(),
          },
          {
            label: 'المواعيد قيد الانتظار',
            value: stats.pendingAppointments.toString(),
          },
        ];

        // Force Angular to update the UI
        this.cdr.detectChanges();
      },

      error: (err) => {
        console.error(
          'Failed to load admin stats:',
          err
        );
      },
    });
  }
} 