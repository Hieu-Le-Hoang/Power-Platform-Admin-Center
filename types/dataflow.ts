// Types for Dataflows
export interface Dataflow {
  msdyn_dataflowid: string;
  msdyn_name: string;
  msdyn_description: string | null;
  createdon: string;
  modifiedon: string;
  statecode: number;
  statuscode: number;
  msdyn_refreshsettings: string | null;
  msdyn_refreshhistory: string | null;
  msdyn_mashupsettings: string | null;
  msdyn_mashupdocument: string | null;

  // Owner
  '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;

  // Derived fields
  statusText?: string;
  refreshStatus?: string;
}

export interface DataflowDataverseResponse {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: Dataflow[];
}

export interface FetchDataflowsResult {
  dataflows: Dataflow[];
  nextLink: string | null;
  totalCount: number;
}
