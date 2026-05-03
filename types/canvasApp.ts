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
