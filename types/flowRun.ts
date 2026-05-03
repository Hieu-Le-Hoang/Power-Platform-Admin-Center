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
