import { Component } from '@angular/core';

// TODO(Person 2): admin-only table — GET /api/auditLogs, columns: actor,
// action, target collection/id, timestamp. Guard this route with an
// admin-role guard.
@Component({
  selector: 'app-audit-log-table',
  standalone: true,
  templateUrl: './audit-log-table.component.html'
})
export class AuditLogTableComponent {}
