// URL to a Power Automate flow that returns a plain text JWT.
export const ACCESS_TOKEN_URL = 'https://de210e4bcd22e60591ca8e841aad4b.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1db8c4d15497441287f7c888e8888ed4/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=yJt8b-T8Y5cybSXqjRjD4nziIvXhPV7F0IfNM-aV6Lg';

// URL to a Power Automate flow that securely logs a sign-in event to Google Sheets.
export const LOG_SIGNIN_URL = 'https://de210e4bcd22e60591ca8e841aad4b.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/574e7c682cd549c18ff365f03f61b2ef/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=wFQCSBIZNdAdlbET1jOMwZaMJyHIDiXZ6fhJ7sWC2Iw';

// Google Sheets API configuration for authentication
export const GOOGLE_SHEETS_API_KEY = 'AIzaSyBy9CU50n2Ha2iatnHuYf6lrw0F3Y7khuE';
export const SPREADSHEET_ID = '1BH3fOY-xclgp5OT1YoWgbDZ4ZkPNS-2fzwLdxoVg60U';
export const ACCOUNT_SHEET_NAME = 'Account';

export const BASE_DATAVERSE_URL = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/workflows';
export const BASE_DATAVERSE_URL_DATAFLOWS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/msdyn_dataflows';
export const BASE_DATAVERSE_URL_SOLUTIONS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/solutions';
export const BASE_DATAVERSE_URL_AUDITS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/audits';
export const BASE_DATAVERSE_URL_ENVVAR_VALUES = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/environmentvariablevalues';
export const BASE_DATAVERSE_URL_CANVAS_APPS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/canvasapps';
export const BASE_DATAVERSE_URL_MODEL_DRIVEN_APPS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/appmodules';
export const BASE_DATAVERSE_URL_CUSTOM_CONTROLS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/customcontrols';
export const BASE_DATAVERSE_URL_WEB_RESOURCES = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/webresourceset';
export const BASE_DATAVERSE_URL_SITEMAPS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/sitemaps';
export const BASE_DATAVERSE_URL_ROLES = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/roles';
export const BASE_DATAVERSE_URL_FIELD_SECURITY_PROFILES = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/fieldsecurityprofiles';
export const BASE_DATAVERSE_URL_CONNECTION_REFERENCES = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/connectionreferences';
export const BASE_DATAVERSE_URL_FORMS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/systemforms';
export const BASE_DATAVERSE_URL_VIEWS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/savedqueries';
export const BASE_DATAVERSE_URL_FLOW_SESSIONS = 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/flowsessions';


// Fields to select from the Dataverse API for workflows.
export const WORKFLOW_FIELDS = [
    'workflowid',
    'name',
    'category',
    'statecode',
    'createdon',
    'modifiedon',
    'clientdata',
    'description',
    'resourceid',
    '_ownerid_value',
    'ismanaged',
].join(',');

// Fields to select from the Dataverse API for flow sessions (runs).
export const FLOW_SESSION_FIELDS = [
    'flowsessionid',
    'statuscode',
    'startedon',
    'completedon',
    'errorcode',
    'errormessage',
].join(',');

// Fields to select from the Dataverse API for dataflows.
export const DATAFLOW_FIELDS = [
    'msdyn_dataflowid',
    'msdyn_name',
    'msdyn_description',
    'createdon',
    'modifiedon',
    'statecode',
    'statuscode',
    '_ownerid_value',
    'msdyn_refreshsettings',
    'msdyn_refreshhistory',
    'msdyn_mashupsettings',
    'msdyn_mashupdocument',
].join(',');

// Fields to select from the Dataverse API for solutions.
export const SOLUTION_FIELDS = [
    'solutionid',
    'friendlyname',
    'uniquename',
    'version',
    'ismanaged',
    'createdon',
    'modifiedon',
    'description',
    '_publisherid_value',
].join(',');

// Fields for Environment Variable Definitions (used in an $expand query).
export const ENVVAR_DEFINITION_FIELDS = [
    'environmentvariabledefinitionid',
    'displayname',
    'schemaname',
    'type',
    'defaultvalue',
    'description',
    '_ownerid_value',
    'createdon',
    'modifiedon',
].join(',');

export const CANVAS_APP_FIELDS = [
    'canvasappid',
    'displayname',
    'description',
    '_ownerid_value',
    'appopenuri',
    'databasereferences',
    'createdtime',
    'versionnumber',
    'name',
    'lastmodifiedtime',
    'lastpublishtime',
    'commitmessage',
    'ismanaged',
].join(',');

export const MODEL_DRIVEN_APP_FIELDS = [
    'appmoduleid',
    'name',
    'uniquename',
    'description',
    'createdon',
    'modifiedon',
    'clienttype',
    'ismanaged',
].join(',');

export const CUSTOM_CONTROL_FIELDS = [
    'customcontrolid',
    'name',
    'version',
    'compatibledatatypes',
    'manifest',
    'createdon',
    'modifiedon',
    '_createdby_value',
].join(',');

export const WEB_RESOURCE_FIELDS = [
    'webresourceid',
    'name',
    'displayname',
    'description',
    'webresourcetype',
    'content',
    'createdon',
    'modifiedon',
    '_createdby_value',
].join(',');

export const SITEMAP_FIELDS = [
    'sitemapid',
    'sitemapname',
    'sitemapxml',
    'ismanaged',
    'createdon',
    'modifiedon',
    'versionnumber',
].join(',');

export const ROLE_FIELDS = [
    'roleid',
    'name',
    'ismanaged',
    'createdon',
    'modifiedon',
    '_businessunitid_value',
].join(',');

export const FIELD_SECURITY_PROFILE_FIELDS = [
    'fieldsecurityprofileid',
    'name',
    'description',
    'createdon',
    'modifiedon',
].join(',');

export const CONNECTION_REFERENCE_FIELDS = [
    'connectionreferenceid',
    'connectionreferencelogicalname',
    'connectorid',
    'description',
    'createdon',
    'modifiedon',
    '_ownerid_value',
].join(',');

export const FORM_FIELDS = [
    'formid',
    'name',
    'description',
    'type',
    'objecttypecode',
    'ismanaged',
    'formxml',
].join(',');

export const VIEW_FIELDS = [
    'savedqueryid',
    'name',
    'description',
    'returnedtypecode',
    'querytype',
    'ismanaged',
    'createdon',
    'modifiedon',
    'fetchxml',
    'layoutxml',
].join(',');


export const WORKFLOW_CATEGORY_OPTIONS = [
    { value: '0', label: 'Workflow' },
    { value: '1', label: 'Dialog' },
    { value: '2', label: 'Business Rule' },
    { value: '3', label: 'Action' },
    { value: '4', label: 'Business Process Flow' },
    { value: '5', label: 'Modern Flow' },
    { value: '6', label: 'Desktop Flow' },
    { value: '7', label: 'AI Flow' },
];

export const WEB_RESOURCE_TYPE_OPTIONS = [
    { value: '1', label: 'HTML' },
    { value: '2', label: 'CSS' },
    { value: '3', label: 'Script (JScript)' },
    { value: '4', label: 'XML' },
    { value: '5', label: 'PNG' },
    { value: '6', label: 'JPG' },
    { value: '7', label: 'GIF' },
    { value: '8', label: 'Silverlight (XAP)' },
    { value: '9', label: 'ICO' },
    { value: '10', label: 'Vector (SVG)' },
];

export const VIEW_TYPE_OPTIONS = [
    { value: '0', label: 'Main Application' },
    { value: '1', label: 'Advanced Find' },
    { value: '2', label: 'Saved Search' },
    { value: '4', label: 'Quick Find' },
    { value: '64', label: 'Lookup' },
];