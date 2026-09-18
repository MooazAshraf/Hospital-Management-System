import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService } from '../../../services/audit-log.service';

@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-log-table.component.html',
})
export class AuditLogTableComponent implements OnInit {
  private auditLogService = inject(AuditLogService);

  auditLogs: any[] = [];
  loading = false;
  error = '';

  ngOnInit(): void {
    this.getAuditLogs();
  }

  getAuditLogs(): void {
    this.loading = true;
    this.error = '';

    this.auditLogService.getAuditLogs().subscribe({
      next: (response) => {
        this.auditLogs = response.data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load audit logs';
        this.loading = false;
      },
    });
  }
}
