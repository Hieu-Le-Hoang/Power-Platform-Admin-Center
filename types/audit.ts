// Types for Audit Logs
export type AuditLogAction = 'CREATE' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: string;
  timestamp: Date;
  tableName: string;
  action: AuditLogAction;
  recordId: string;
  user: {
    id: string;
    name: string;
  };
  changes: string;
  changeSummary: string;
  // Raw data for details modal
  _raw: RawAuditLog;
}

export interface FilterCriteria {
    startDate: string;
    endDate: string;
    tableName: string;
    action: 'ALL' | AuditLogAction;
    recordId: string;
    userId: string;
    pageSize: number;
}

export interface RawAuditLog {
  auditid: string;
  createdon: string;
  objecttypecode: string; // This is the table name
  action: number; // 1: Create, 2: Update, 3: Delete
  _objectid_value: string; // Record ID
  _userid_value: string;
  '_userid_value@OData.Community.Display.V1.FormattedValue': string;
  changedata: string | null; // JSON string with change details for updates
}

export interface DynamicsAuditResponse {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: RawAuditLog[];
}

export interface FetchAuditLogsResponse {
    logs: AuditLog[];
    totalCount: number;
    nextLink: string | null;
}
