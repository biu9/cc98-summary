import { POST } from "@/request/POST";

export const handleMBTI = async (text: string) => {
  try {
    const res = await POST<any, any>('/api/mbti', {
      text
    });
    return res.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}