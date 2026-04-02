import type { ITopic } from "@cc98/api";

export interface IOrganizeFavoriteTopicInput {
  id: number;
  title: string;
  boardName: string;
  userName: string;
  replyCount: number;
  likeCount: number;
  hitCount: number;
  lastPostTime: string;
  preview: string;
  sourceGroupName: string;
}

export interface IOrganizedFavoriteGroup {
  name: string;
  description: string;
  topicIds: number[];
}

export interface IOrganizedFavoritePlan {
  overview: string;
  groups: IOrganizedFavoriteGroup[];
}

export interface IOrganizedFavoriteTopicView extends ITopic {
  sourceGroupNames: string[];
}

export interface IOrganizedFavoriteGroupView extends IOrganizedFavoriteGroup {
  topics: IOrganizedFavoriteTopicView[];
}
