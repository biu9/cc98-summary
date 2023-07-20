declare module "@request/api" {
    export interface ISummaryResponse {
        msg: string,
        code: number
    }
    export interface ISummaryRequest {
        messages: {
            role:string,
            content:string
        }[]
    }
}