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
