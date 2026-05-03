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

export type Theme = 'dark' | 'light';

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

// Types for Environment Variables
// Represents the flattened combination of a value and its definition
export interface EnvironmentVariable {
    environmentvariablevalueid: string;
    currentvalue: string | null;
    // from definition
    displayname: string;
    schemaname: string;
    type: number;
    'type@OData.Community.Display.V1.FormattedValue'?: string;
    defaultvalue: string | null;
    description: string | null;
    createdon: string;
    modifiedon: string;
    owner?: string;
    typeName?: string;
}

// Represents a single item from the API response from the 'environmentvariablevalues' entity
export interface EnvironmentVariableValueApiResponse {
    environmentvariablevalueid: string;
    value: string | null;
    environmentvariabledefinitionid: {
        environmentvariabledefinitionid: string;
        displayname: string;
        schemaname: string;
        type: number;
        'type@OData.Community.Display.V1.FormattedValue'?: string;
        defaultvalue: string | null;
        description: string | null;
        createdon: string;
        modifiedon: string;
        '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;
    };
}

// The overall API response structure for a query to 'environmentvariablevalues'
export interface EnvironmentVariableValueDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: EnvironmentVariableValueApiResponse[];
}

export interface FetchEnvironmentVariablesResult {
  variables: EnvironmentVariable[];
  nextLink: string | null;
  totalCount: number;
}

// Types for Canvas Apps
export interface CanvasApp {
    canvasappid: string;
    displayname: string;
    description: string | null;
    appopenuri: string;
    '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;
    databasereferences: string | null;
    createdtime: string;
    versionnumber: string;
    name: string;
    lastmodifiedtime: string;
    lastpublishtime: string;
    commitmessage: string | null;
    ismanaged: boolean;
}

export interface CanvasAppDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: CanvasApp[];
}

export interface FetchCanvasAppsResult {
    apps: CanvasApp[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Model-driven Apps
export interface ModelDrivenApp {
    appmoduleid: string;
    name: string;
    uniquename: string;
    description: string | null;
    createdon: string;
    modifiedon: string;
    clienttype: number;
    ismanaged: boolean;

    // Derived fields
    clientTypeText?: string;
    isManagedText?: string;
}

export interface ModelDrivenAppDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: ModelDrivenApp[];
}

export interface FetchModelDrivenAppsResult {
    apps: ModelDrivenApp[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Custom Controls (PCF)
export interface CustomControl {
    customcontrolid: string;
    name: string;
    version: string;
    compatibledatatypes: string | null;
    manifest: string | null;
    createdon: string;
    modifiedon: string;
    '_createdby_value@OData.Community.Display.V1.FormattedValue'?: string;
}

export interface CustomControlDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: CustomControl[];
}

export interface FetchCustomControlsResult {
    controls: CustomControl[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Web Resources
export interface WebResource {
    webresourceid: string;
    name: string;
    displayname: string | null;
    description: string | null;
    webresourcetype: number;
    content: string; // Base64 encoded string
    createdon: string;
    modifiedon: string;
    '_createdby_value@OData.Community.Display.V1.FormattedValue'?: string;

    // Derived fields
    typeName?: string;
}

export interface WebResourceDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: WebResource[];
}

export interface FetchWebResourcesResult {
    resources: WebResource[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Site Maps
export interface SiteMap {
    sitemapid: string;
    sitemapname: string | null;
    sitemapxml: string | null;
    ismanaged: boolean;
    createdon: string;
    modifiedon: string;
    versionnumber: string;
    isManagedText?: string;
}
export interface SiteMapDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: SiteMap[];
}
export interface FetchSiteMapsResult {
    sitemaps: SiteMap[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Security Roles
export interface SecurityRole {
    roleid: string;
    name: string;
    ismanaged: boolean;
    createdon: string;
    modifiedon: string;
    _businessunitid_value: string;
    '_businessunitid_value@OData.Community.Display.V1.FormattedValue'?: string;
    isManagedText?: string;
}
export interface SecurityRoleDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: SecurityRole[];
}
export interface FetchSecurityRolesResult {
    roles: SecurityRole[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Field Security Profiles
export interface FieldSecurityProfile {
    fieldsecurityprofileid: string;
    name: string;
    description: string | null;
    createdon: string;
    modifiedon: string;
}
export interface FieldSecurityProfileDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: FieldSecurityProfile[];
}
export interface FetchFieldSecurityProfilesResult {
    profiles: FieldSecurityProfile[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Connection References
export interface ConnectionReference {
    connectionreferenceid: string;
    connectionreferencelogicalname: string;
    connectorid: string;
    description: string | null;
    createdon: string;
    modifiedon: string;
    '_ownerid_value@OData.Community.Display.V1.FormattedValue'?: string;
}
export interface ConnectionReferenceDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: ConnectionReference[];
}
export interface FetchConnectionReferencesResult {
    connections: ConnectionReference[];
    nextLink: string | null;
    totalCount: number;
}

// FIX: Add missing Form and View types
// Types for Forms (systemforms)
export interface Form {
    formid: string;
    name: string;
    description: string | null;
    type: number;
    objecttypecode: string;
    ismanaged: boolean;
    createdon: string;
    modifiedon: string;
    formxml: string | null;
    
    // Derived
    typeName?: string;
    isManagedText?: string;
}

export interface FormDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: Form[];
}

export interface FetchFormsResult {
    forms: Form[];
    nextLink: string | null;
    totalCount: number;
}

// Types for Views (savedqueries)
export interface View {
    savedqueryid: string;
    name: string;
    description: string | null;
    returnedtypecode: string;
    querytype: number;
    ismanaged: boolean;
    createdon: string;
    modifiedon: string;
    fetchxml: string | null;
    layoutxml: string | null;
    
    // Derived
    isManagedText?: string;
    queryTypeName?: string;
}

export interface ViewDataverseResponse {
    '@odata.count'?: number;
    '@odata.nextLink'?: string;
    value: View[];
}

export interface FetchViewsResult {
    views: View[];
    nextLink: string | null;
    totalCount: number;
}
// FIX: Add missing FlowRun and FlowRunDataverseResponse types
export interface FlowRun {
    flowsessionid: string;
    startedon: string;
    completedon: string | null;
    statuscode: number;
    'statuscode@OData.Community.Display.V1.FormattedValue'?: string;
    errorcode: string | null;
    errormessage: string | null;

    // Derived
    statusText?: string;
}

export interface FlowRunDataverseResponse {
    value: FlowRun[];
}
