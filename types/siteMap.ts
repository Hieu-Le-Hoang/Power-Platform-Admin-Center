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
