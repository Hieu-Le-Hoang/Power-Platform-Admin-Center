// Types for Solutions
export interface Solution {
  solutionid: string;
  friendlyname: string;
  uniquename: string;
  version: string;
  ismanaged: boolean;
  'ismanaged@OData.Community.Display.V1.FormattedValue'?: string;
  createdon: string;
  modifiedon: string;
  description: string | null;
  _publisherid_value: string;
  '_publisherid_value@OData.Community.Display.V1.FormattedValue'?: string;

  // Derived fields
  publisherName?: string;
  isManagedText?: string;
}

export interface SolutionDataverseResponse {
  '@odata.count'?: number;
  '@odata.nextLink'?: string;
  value: Solution[];
}

export interface FetchSolutionsResult {
  solutions: Solution[];
  nextLink: string | null;
  totalCount: number;
}
