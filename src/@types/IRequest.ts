declare module "@request/api" {
  export interface ISummaryResponse {
    msg: string,
    code: number
  }
  export interface IGeneralResponse {
    isOk: boolean,
    data: any,
    msg: string,
  }
  export interface IMBTIRequest {
    text: string
  }
  export interface ISummaryRequest {
    text: string
  }
}