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
    text: string,
    username: string
  }
  export interface ISummaryRequest {
    text: string
  }
  export interface IMBTIResponse {
    first: {
      type: string;
      explanation: string;
    };
    second: {
      type: string;
      explanation: string;
    };
    third: {
      type: string;
      explanation: string;
    };
    fourth: {
      type: string;
      explanation: string;
    };
    potential: {
      type: string;
      explanation: string;
    }
  }
}