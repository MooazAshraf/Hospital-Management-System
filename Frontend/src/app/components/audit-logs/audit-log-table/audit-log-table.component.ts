import {
  Component,
  OnInit,
  inject,
} from '@angular/core';

import { CommonModule } from '@angular/common';

import {
  AuditLog,
  AuditLogService,
  AuditLogsResponse,
} from '../../../services/audit-log.service';


@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-table.component.html',
})
export class AuditLogTableComponent implements OnInit {

  private readonly auditLogService =
    inject(AuditLogService);

  auditLogs: AuditLog[] = [];

  loading = true;

  error = '';


  ngOnInit(): void {
    this.loadAuditLogs();
  }


  loadAuditLogs(): void {

    this.loading = true;

    this.error = '';

    console.log(
      '[AUDIT LOGS] Loading...'
    );


    this.auditLogService
      .getAuditLogs()
      .subscribe({

        next: (
          response: AuditLogsResponse
        ) => {

          console.log(
            '[AUDIT LOGS] response:',
            response
          );


          if (response?.success) {

            /*
             * الـ Backend بيرجع:
             *
             * {
             *   success: true,
             *   data: [...]
             * }
             *
             * لذلك لازم نستخدم response.data
             */
            this.auditLogs =
              Array.isArray(response.data)
                ? response.data
                : [];

            console.log(
              '[AUDIT LOGS] logs:',
              this.auditLogs
            );

            console.log(
              '[AUDIT LOGS] loading:',
              false
            );

          } else {

            this.auditLogs = [];

            this.error =
              response?.message ||
              'Failed to load audit logs.';
          }


          this.loading = false;

          console.log(
            '[AUDIT LOGS] request completed'
          );
        },


        error: (err: any) => {

          console.error(
            '[AUDIT LOGS] error:',
            err
          );

          this.auditLogs = [];


          if (err?.status === 401) {

            this.error =
              'انتهت صلاحية تسجيل الدخول. برجاء تسجيل الدخول مرة أخرى.';

          } else if (err?.status === 403) {

            this.error =
              'ليس لديك صلاحية لعرض سجل العمليات.';

          } else if (err?.status === 404) {

            this.error =
              'لم يتم العثور على Audit Logs API.';

          } else {

            this.error =
              err?.error?.message ||
              'حدث خطأ أثناء تحميل سجل العمليات.';
          }


          this.loading = false;
        },
      });
  }


  getUserName(
    log: AuditLog
  ): string {

    return (
      log?.performedBy?.name ||
      log?.performedBy?.email ||
      'Unknown'
    );
  }


  getActionLabel(
    action: string | undefined
  ): string {

    switch (action) {

      case 'LOGIN':
        return 'تسجيل الدخول';

      case 'LOGOUT':
        return 'تسجيل الخروج';

      case 'CREATE':
        return 'إنشاء';

      case 'UPDATE':
        return 'تعديل';

      case 'DELETE':
        return 'حذف';

      case 'VIEW':
        return 'عرض';

      case 'StatusChange':
        return 'تغيير الحالة';

      case 'Update':
        return 'تعديل';

      case 'Create':
        return 'إنشاء';

      case 'Delete':
        return 'حذف';

      default:
        return action || '-';
    }
  }


  getResourceLabel(
    resource: string | undefined
  ): string {

    if (!resource) {
      return '-';
    }


    switch (
      resource.toLowerCase()
    ) {

      case 'user':
      case 'users':
        return 'المستخدمين';

      case 'patient':
      case 'patients':
        return 'المرضى';

      case 'doctor':
      case 'doctors':
        return 'الأطباء';

      case 'appointment':
      case 'appointments':
        return 'المواعيد';

      case 'medicine':
      case 'medicines':
        return 'الأدوية';

      case 'payment':
      case 'payments':
        return 'المدفوعات';

      case 'medicalreport':
      case 'medicalreports':
      case 'medical-reports':
        return 'التقارير الطبية';

      case 'department':
      case 'departments':
        return 'الأقسام';

      case 'review':
      case 'reviews':
        return 'التقييمات';

      default:
        return resource;
    }
  }


  formatDate(
    date: string | Date | undefined
  ): string {

    if (!date) {
      return '-';
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return '-';
    }


    return parsedDate.toLocaleString(
      'ar-EG',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      }
    );
  }


  trackByLogId(
    index: number,
    log: AuditLog
  ): string | number {

    return (
      log?._id ||
      index
    );
  }
}