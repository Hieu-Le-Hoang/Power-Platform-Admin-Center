// Types for Forms (systemforms)
export interface Form {
    formid: string;
    name: string;
    description: string | null;
    type: number;
    objecttypecode: string;
    ismanaged: boolean;
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