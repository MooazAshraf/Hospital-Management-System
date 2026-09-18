import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Doctor {
  name: string;
  specialty: string;
  description: string;
  city: string;
  rating: string;
}

interface Specialty {
  name: string;
  key: string;
}

interface SpecialtyPage {
  specialties: Specialty[];
  doctors: Doctor[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './home.component.html'
})
export class HomeComponent {

  currentPage = 0;

  specialtyPages: SpecialtyPage[] = [

    // =====================================================
    // PAGE 1
    // =====================================================

    {
      specialties: [
        {
          name: 'أنف وأذن وحنجرة',
          key: 'ent'
        },
        {
          name: 'أطفال',
          key: 'pediatrics'
        },
        {
          name: 'طب باطني',
          key: 'internal'
        },
        {
          name: 'أسنان',
          key: 'dentistry'
        }
      ],

      doctors: [
        {
          name: 'د. أحمد حسن',
          specialty: 'استشاري قلب',
          description:
            'استشاري قلب متخصص في تقديم الرعاية القلبية المتكاملة.',
          city: 'القاهرة',
          rating: '8'
        },

        {
          name: 'د. سارة محمد',
          specialty: 'استشاري أسنان',
          description:
            'متخصصة في علاج الأسنان وتقديم رعاية مريحة للمرضى.',
          city: 'القاهرة',
          rating: '8'
        },

        {
          name: 'د. عمر علي',
          specialty: 'استشاري مخ وأعصاب',
          description:
            'استشاري مخ وأعصاب متخصص في التشخيص والعلاج المتكامل.',
          city: 'القاهرة',
          rating: '8'
        }
      ]
    },


    // =====================================================
    // PAGE 2
    // =====================================================

    {
      specialties: [
        {
          name: 'قلب',
          key: 'cardiology'
        },
        {
          name: 'مخ وأعصاب',
          key: 'neurology'
        },
        {
          name: 'جلدية',
          key: 'dermatology'
        },
        {
          name: 'نساء وتوليد',
          key: 'gynecology'
        }
      ],

      doctors: [
        {
          name: 'د. محمد علي',
          specialty: 'استشاري قلب',
          description:
            'استشاري أمراض القلب والأوعية الدموية.',
          city: 'القاهرة',
          rating: '9'
        },

        {
          name: 'د. ياسمين أحمد',
          specialty: 'استشاري جلدية',
          description:
            'متخصصة في علاج الأمراض الجلدية والعناية بالبشرة.',
          city: 'القاهرة',
          rating: '9'
        },

        {
          name: 'د. خالد محمود',
          specialty: 'استشاري مخ وأعصاب',
          description:
            'متخصص في تشخيص وعلاج أمراض المخ والأعصاب.',
          city: 'القاهرة',
          rating: '8'
        }
      ]
    },


    // =====================================================
    // PAGE 3
    // =====================================================

    {
      specialties: [
        {
          name: 'عيون',
          key: 'ophthalmology'
        },
        {
          name: 'عظام',
          key: 'orthopedics'
        },
        {
          name: 'مسالك بولية',
          key: 'urology'
        },
        {
          name: 'تغذية',
          key: 'nutrition'
        }
      ],

      doctors: [
        {
          name: 'د. كريم حسن',
          specialty: 'استشاري عيون',
          description:
            'استشاري طب وجراحة العيون والفحوصات المتخصصة.',
          city: 'القاهرة',
          rating: '9'
        },

        {
          name: 'د. محمود سامي',
          specialty: 'استشاري عظام',
          description:
            'متخصص في علاج مشاكل العظام والمفاصل.',
          city: 'القاهرة',
          rating: '8'
        },

        {
          name: 'د. نور محمد',
          specialty: 'استشاري تغذية',
          description:
            'متخصصة في التغذية العلاجية ووضع الأنظمة الغذائية.',
          city: 'القاهرة',
          rating: '9'
        }
      ]
    },


    // =====================================================
    // PAGE 4
    // =====================================================

    {
      specialties: [
        {
          name: 'طب نفسي',
          key: 'psychiatry'
        },
        {
          name: 'جراحة عامة',
          key: 'surgery'
        },
        {
          name: 'صدر وحساسية',
          key: 'chest'
        },
        {
          name: 'كلى',
          key: 'nephrology'
        }
      ],

      doctors: [
        {
          name: 'د. علي حسن',
          specialty: 'استشاري طب نفسي',
          description:
            'متخصص في الصحة النفسية والاستشارات العلاجية.',
          city: 'القاهرة',
          rating: '9'
        },

        {
          name: 'د. سامح أحمد',
          specialty: 'استشاري جراحة عامة',
          description:
            'استشاري جراحة عامة متخصص في العديد من الحالات الجراحية.',
          city: 'القاهرة',
          rating: '8'
        },

        {
          name: 'د. منى خالد',
          specialty: 'استشاري صدر وحساسية',
          description:
            'متخصصة في أمراض الصدر والحساسية والجهاز التنفسي.',
          city: 'القاهرة',
          rating: '9'
        }
      ]
    }
  ];


  // =====================================================
  // CURRENT DATA
  // =====================================================

  get currentSpecialties(): Specialty[] {
    return this.specialtyPages[this.currentPage].specialties;
  }


  get currentDoctors(): Doctor[] {
    return this.specialtyPages[this.currentPage].doctors;
  }


  // =====================================================
  // NEXT
  // =====================================================

  nextPage(): void {

    if (this.currentPage < this.specialtyPages.length - 1) {
      this.currentPage++;
    } else {
      this.currentPage = 0;
    }

  }


  // =====================================================
  // PREVIOUS
  // =====================================================

  previousPage(): void {

    if (this.currentPage > 0) {
      this.currentPage--;
    } else {
      this.currentPage = this.specialtyPages.length - 1;
    }

  }


  // =====================================================
  // GO TO SPECIFIC PAGE
  // =====================================================

  goToPage(index: number): void {
    this.currentPage = index;
  }


  // =====================================================
  // SPECIALTY CLICK
  // =====================================================

  selectSpecialty(specialty: Specialty): void {

    console.log('Selected specialty:', specialty.name);

    // هنا تقدر بعدين تبعت التخصص للـ Doctors page
    // لما نربطه بالـ backend.

  }


  // =====================================================
  // ICON
  // =====================================================

  getSpecialtyIcon(key: string): string {

    switch (key) {

      case 'dentistry':
        return 'dentistry';

      case 'internal':
        return 'internal';

      case 'pediatrics':
        return 'pediatrics';

      case 'ent':
        return 'ent';

      case 'cardiology':
        return 'cardiology';

      case 'neurology':
        return 'neurology';

      case 'dermatology':
        return 'dermatology';

      case 'gynecology':
        return 'gynecology';

      case 'ophthalmology':
        return 'ophthalmology';

      case 'orthopedics':
        return 'orthopedics';

      case 'urology':
        return 'urology';

      case 'nutrition':
        return 'nutrition';

      case 'psychiatry':
        return 'psychiatry';

      case 'surgery':
        return 'surgery';

      case 'chest':
        return 'chest';

      case 'nephrology':
        return 'nephrology';

      default:
        return 'doctor';

    }

  }

}