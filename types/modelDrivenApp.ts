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
