import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AppointmentCardComponent } from '../../appointments/appointment-card/appointment-card.component'; // عدل المسار حسب مجلدك
import { AppointmentService } from '../../../services/appointment.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, AppointmentCardComponent],
  templateUrl: './patient-dashboard.component.html',
})
export class PatientDashboardComponent implements OnInit {
  @Input() notifications: any[] = [];
  @Input() user: any = null;

  upcomingAppointment: any = null;
  loading = true;

  constructor(
    private appointmentService: AppointmentService,
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
}
