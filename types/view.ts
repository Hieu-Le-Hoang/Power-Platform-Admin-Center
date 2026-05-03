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
