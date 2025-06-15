import { GET } from "@/request";
import { ITopic, ITopicGroup } from "@cc98/api";
import { API_ROOT } from "../../config";

export async function getFavouriteTopicGroup(token: string): Promise<ITopicGroup[]> {
  const url = `${API_ROOT}/me/favorite-topic-group?sf_request_type=fetch`;
  const res = await GET<{ data: ITopicGroup[] }>(url, token);
  return res.data;
}

export async function getFavouriteTopicContent(from: number, size: number, order: number, groupid: number, token: string): Promise<ITopic[]> {
  const url = `${API_ROOT}/topic/me/favorite?from=${from}&size=${size}&order=${order}&groupid=${groupid}&sf_request_type=fetch`;
  const res = await GET<ITopic[]>(url, token);
  return res;
}

/**
 * 获取收藏夹下的所有帖子
 * @param groupid 收藏夹ID
 * @param token 
 * @returns 帖子列表
 */
export async function getAFavouriteTopicContent(group: ITopicGroup, token: string): Promise<ITopic[]> {
  const page = 10;
  const res: ITopic[] = [];
  for (let i = 0; i < Math.ceil(group.count / page); i++) {
    const data = await getFavouriteTopicContent(i * page, page, 0, group.id, token);
    res.push(...data);
  }
  return res;
}