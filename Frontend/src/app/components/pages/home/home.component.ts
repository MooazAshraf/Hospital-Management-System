import { Component } from '@angular/core';
import { NavbarComponent } from '../../shared/navbar/navbar.component';
import { HeroComponent } from '../../shared/hero/hero.component';
import { HighlightsComponent } from '../../shared/highlights/highlights.component';
import { StatsComponent } from '../../shared/stats/stats.component';
import { DepartmentsListComponent } from '../../departments/departments-list/departments-list.component';
import { DoctorsListComponent } from '../../doctors/doctors-list/doctors-list.component';
import { WhyChooseUsComponent } from '../../shared/why-choose-us/why-choose-us.component';
import { BookingStepsComponent } from '../../appointments/booking-steps/booking-steps.component';
import { ReviewsListComponent } from '../../reviews/reviews-list/reviews-list.component';
import { EmergencyCtaComponent } from '../../shared/emergency-cta/emergency-cta.component';
import { ContactComponent } from '../../shared/contact/contact.component';
import { FooterComponent } from '../../shared/footer/footer.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    NavbarComponent,
    HeroComponent,
    HighlightsComponent,
    StatsComponent,
    DepartmentsListComponent,
    DoctorsListComponent,
    WhyChooseUsComponent,
    BookingStepsComponent,
    ReviewsListComponent,
    EmergencyCtaComponent,
    ContactComponent,
    FooterComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
