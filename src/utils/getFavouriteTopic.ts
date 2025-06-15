import { GET } from "@/request";
import { ITopic, ITopicGroup } from "@cc98/api";
import { API_ROOT } from "../../config";

export async function getFavouriteTopicGroup(token: string): Promise<ITopicGroup[]> {
  const url = `${API_ROOT}/me/favorite-topic-group?sf_request_type=fetch`;
  const res = await GET<ITopicGroup[]>(url, token);
  return res;
}

export async function getFavouriteTopicContent(from: number, size: number, order: number, groupid: number, token: string): Promise<ITopic[]> {
  const url = `${API_ROOT}/topic/me/favorite?from=${from}&size=${size}&order=${order}&groupid=${groupid}&sf_request_type=fetch`;
  const res = await GET<ITopic[]>(url, token);
  return res;
}