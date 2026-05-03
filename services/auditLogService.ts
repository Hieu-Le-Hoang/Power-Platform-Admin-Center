import { authenticatedFetch } from './apiService';
import { AuditLog, FilterCriteria, RawAuditLog, DynamicsAuditResponse, FetchAuditLogsResponse } from '../types';
import { BASE_DATAVERSE_URL_AUDITS } from '../constants';

const mapAction = (actionCode: number): 'CREATE' | 'UPDATE' | 'DELETE' => {
  switch (actionCode) {
    case 1: return 'CREATE';
    case 2: return 'UPDATE';
    case 3: return 'DELETE';
    default: return 'UPDATE'; // Default or handle as unknown
  }
};

const mapFilterActionToActionCode = (action: FilterCriteria['action']): number | null => {
    switch (action) {
        case 'CREATE': return 1;
        case 'UPDATE': return 2;
        case 'DELETE': return 3;
        default: return null; // Corresponds to 'ALL'
    }
};

const mapRawLogToAuditLog = (rawLog: RawAuditLog): AuditLog => {
  let changesString = 'N/A';
  let changeSummary = '';
  const action = mapAction(rawLog.action);

  switch (action) {
    case 'CREATE':
      changeSummary = 'Record created.';
      changesString = 'Initial values were set upon record creation.';
      break;
    case 'DELETE':
      changeSummary = 'Record deleted.';
      changesString = 'The record was permanently removed from the system.';
      break;
    case 'UPDATE':
      if (rawLog.changedata) {
        try {
          const changeData = JSON.parse(rawLog.changedata);
          if (changeData && Array.isArray(changeData.changedAttributes) && changeData.changedAttributes.length > 0) {
            changesString = changeData.changedAttributes.map((attr: { logicalName: string; oldValue: any; newValue: any; }) => {
              const oldVal = JSON.stringify(attr.oldValue);
              const newVal = JSON.stringify(attr.newValue);
              return `${attr.logicalName}:\n\t${oldVal} -> ${newVal}`;
            }).join('\n\n');
            const count = changeData.changedAttributes.length;
            changeSummary = `${count} field${count > 1 ? 's' : ''} updated.`;
          } else {
            changesString = 'No detailed changes available.';
            changeSummary = 'Update detected, no details.';
          }
        } catch (e) {
          const changedFields = rawLog.changedata.split(',').filter(f => f.trim() !== '');
          if (changedFields.length > 0) {
            changesString = "Fields changed:\n" + changedFields.map(field => `- ${field.trim()}`).join('\n');
            const count = changedFields.length;
            changeSummary = `${count} field${count > 1 ? 's' : ''} changed.`;
          } else {
            changesString = 'Change detected, but no specific fields were listed.';
            changeSummary = 'Update detected, no details.';
          }
        }
      } else {
        changeSummary = 'Update detected, no changes listed.';
        changesString = 'Change detected, but no change data was provided.';
      }
      break;
    default:
      changeSummary = 'Unknown action.';
      changesString = 'Details for this action are not available.';
  }

  return {
    id: rawLog.auditid,
    timestamp: new Date(rawLog.createdon),
    tableName: rawLog.objecttypecode,
    action: action,
    recordId: rawLog._objectid_value,
    user: {
      id: rawLog._userid_value,
      name: rawLog['_userid_value@OData.Community.Display.V1.FormattedValue'],
    },
    changes: changesString,
    changeSummary: changeSummary,
    _raw: rawLog,
  };
};

export const fetchAuditLogs = async (filters: FilterCriteria, nextLink: string | null): Promise<FetchAuditLogsResponse> => {
  let url: string;
  const fetchOptions: RequestInit = { 
      method: 'GET',
      headers: {
        'Prefer': `odata.maxpagesize=${filters.pageSize},odata.include-annotations="*"`,
      }
  };

  if (nextLink) {
    url = nextLink;
  } else {
    const filterConditions: string[] = [];

    if (filters.startDate) {
        filterConditions.push(`createdon ge ${filters.startDate}T00:00:00Z`);
    }
    if (filters.endDate) {
        filterConditions.push(`createdon le ${filters.endDate}T23:59:59Z`);
    }
    if (filters.tableName) {
        filterConditions.push(`objecttypecode eq '${filters.tableName}'`);
    }
    const actionCode = mapFilterActionToActionCode(filters.action);
    if (actionCode !== null) {
        filterConditions.push(`action eq ${actionCode}`);
    }
    if (filters.recordId && filters.recordId.trim() !== '') {
        filterConditions.push(`_objectid_value eq ${filters.recordId.trim()}`);
    }
    if (filters.userId && filters.userId.trim() !== '') {
        filterConditions.push(`_userid_value eq ${filters.userId.trim()}`);
    }

    const select = '$select=auditid,createdon,objecttypecode,action,_objectid_value,_userid_value,changedata';
    const expand = '$expand=userid($select=fullname)'; // Although we get the formatted value, this is good practice
    const orderBy = '$orderby=createdon desc';
    const count = '$count=true';
    
    let query = `${select}&${expand}&${orderBy}&${count}`;

    if (filterConditions.length > 0) {
        const filter = `$filter=${filterConditions.join(' and ')}`;
        query += `&${filter}`;
    }
    
    url = `${BASE_DATAVERSE_URL_AUDITS}?${query}`;
  }


  try {
    const response = await authenticatedFetch(url, fetchOptions);
    const data: DynamicsAuditResponse = await response.json();
    
    return {
      logs: data.value.map(mapRawLogToAuditLog),
      totalCount: data['@odata.count'] ?? 0,
      nextLink: data['@odata.nextLink'] || null,
    };

  } catch (error) {
    console.error("Failed to fetch audit logs:", error);
    throw error;
  }
};