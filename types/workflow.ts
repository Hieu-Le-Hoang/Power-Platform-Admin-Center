export interface Workflow {
  workflowid: string;
  name: string;
  category: number;
  'category@OData.Community.Display.V1.FormattedValue'?: string;
  statecode: number;
  'statecode@OData.Community.Display.V1.FormattedValue'?: string;
  createdon: string;
  modifiedon: string;
  clientdata: string | null;
  description: string | null;
  resourceid: string | null;
  ismanaged: boolean;

  // Owner
  '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;

  // Derived fields
  statusText?: string;
  categoryText?: string;
  isManagedText?: string;
}

export interface DataverseResponse {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: Workflow[];
}

export interface FetchWorkflowsResult {
  workflows: Workflow[];
  nextLink: string | null;
  totalCount: number;
}
