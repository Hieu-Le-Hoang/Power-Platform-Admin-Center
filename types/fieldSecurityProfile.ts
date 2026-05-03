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
