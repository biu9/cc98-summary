import { POST } from "@/request/POST";
import { IGeneralResponse } from "@request/api";

export const handleMBTI = async (text: string): Promise<IGeneralResponse> => {
  const res = await POST<any, IGeneralResponse>('/api/mbti', {
    text
  });
  return res;
}