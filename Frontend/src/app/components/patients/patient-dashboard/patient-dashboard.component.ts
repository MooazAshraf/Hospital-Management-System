import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AppointmentCardComponent } from '../../appointments/appointment-card/appointment-card.component'; // عدل المسار حسب مجلدك
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, AppointmentCardComponent],
  templateUrl: './patient-dashboard.component.html',
})
export class PatientDashboardComponent implements OnInit {
  @Input() user: any = null;

  upcomingAppointment: any = null;
  notifications: any[] = [];
  loading = true;
  errorMessage = '';

  constructor(
    private appointmentService: AppointmentService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchDashboardData();
  }

  fetchDashboardData(): void {
    this.loading = true;

    if (!this.user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.user = JSON.parse(savedUser);
      }
    }

    this.notificationService.getMyNotifications().subscribe({
      next: (res) => {
        this.notifications = (res.notifications || []).slice(0, 6);
      },
      error: () => {
        this.notifications = [];
      },
    });

    this.appointmentService.getAll().subscribe({
      next: (res) => {
        if (res.data && res.data.length > 0) {
          this.upcomingAppointment =
            res.data.find((a: any) => a.status !== 'Cancelled' && a.status !== 'Completed') || null;
        } else {
          this.upcomingAppointment = null;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching appointments:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }
  cancelAppointment(id: string): void {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    this.appointmentService.cancel(id).subscribe({
      next: () => this.fetchDashboardData(),
      error: (err) => {
        console.error('Cancel appointment error:', err);
        this.errorMessage = err?.error?.message || 'Failed to cancel appointment';
        this.cdr.detectChanges();
      },
    });
  }


}
