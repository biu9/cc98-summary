import { generateObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { glmChatModel } from "@/lib/models";
import { withCors } from "@/lib/cors";
import type {
  IOrganizedFavoritePlan,
  IOrganizeFavoriteTopicInput,
} from "@/app/favorites/types";

export const runtime = "edge";

const organizeFavoriteTopicSchema = z.object({
  id: z.number(),
  title: z.string(),
  boardName: z.string(),
  userName: z.string(),
  replyCount: z.number(),
  likeCount: z.number(),
  hitCount: z.number(),
  lastPostTime: z.string(),
  preview: z.string(),
  sourceGroupName: z.string(),
});

const organizeFavoriteRequestSchema = z.object({
  dimension: z.string().min(2).max(80),
  sourceLabel: z.string().min(1).max(80),
  topics: z.array(organizeFavoriteTopicSchema).min(1).max(240),
});

const organizeFavoriteResponseSchema = z.object({
  overview: z.string().min(1).max(140),
  groups: z
    .array(
      z.object({
        name: z.string().min(1).max(18),
        description: z.string().min(1).max(80),
        topicIds: z.array(z.number()).min(1),
      })
    )
    .min(1)
    .max(12),
});

function sanitizePlan(
  plan: IOrganizedFavoritePlan,
  topics: IOrganizeFavoriteTopicInput[]
): IOrganizedFavoritePlan {
  const validTopicIds = new Set(topics.map((topic) => topic.id));
  const usedTopicIds = new Set<number>();

  const groups = plan.groups
    .map((group) => {
      const topicIds = group.topicIds.filter((topicId) => {
        if (!validTopicIds.has(topicId) || usedTopicIds.has(topicId)) {
          return false;
        }

        usedTopicIds.add(topicId);
        return true;
      });

      return {
        name: group.name.trim() || "未命名分组",
        description: group.description.trim() || "AI 生成的收藏整理结果。",
        topicIds,
      };
    })
    .filter((group) => group.topicIds.length > 0);

  const unassignedTopicIds = topics
    .map((topic) => topic.id)
    .filter((topicId) => !usedTopicIds.has(topicId));

  if (unassignedTopicIds.length > 0) {
    groups.push({
      name: "其他",
      description: "未被模型稳定归类的帖子。",
      topicIds: unassignedTopicIds,
    });
  }

  return {
    overview: plan.overview.trim() || "已根据指定维度完成收藏整理。",
    groups,
  };
}

async function handler(request: NextRequest) {
  const parsedBody = organizeFavoriteRequestSchema.safeParse(
    await request.json()
  );

  if (!parsedBody.success) {
    return NextResponse.json(
      {
        error: "请求参数不合法。",
        details: parsedBody.error.flatten(),
      },
      { status: 400 }
    );
  }

  const { dimension, sourceLabel, topics } = parsedBody.data;

  const topicText = topics
    .map((topic) => {
      const parts = [
        `ID:${topic.id}`,
        `标题:${topic.title}`,
        `版面:${topic.boardName}`,
        `作者:${topic.userName}`,
        `来源分组:${topic.sourceGroupName}`,
        `回复:${topic.replyCount}`,
        `赞同:${topic.likeCount}`,
        `浏览:${topic.hitCount}`,
        `最近更新:${topic.lastPostTime}`,
      ];

      if (topic.preview) {
        parts.push(`摘要:${topic.preview}`);
      }

      return parts.join(" | ");
    })
    .join("\n");

  try {
    const { object } = await generateObject({
      model: glmChatModel(),
      temperature: 0.2,
      schema: organizeFavoriteResponseSchema,
      prompt: `你是一个擅长整理论坛收藏内容的助手。

现在用户要按“${dimension}”这个维度整理收藏帖子，整理范围是：${sourceLabel}。

请根据给出的帖子信息，完成新的分组方案。

要求：
1. 分组名称要短，适合作为收藏夹分组名。
2. 每个帖子只能出现一次。
3. 不要遗漏帖子。
4. 优先按用户指定的维度分组，不要机械按原分组或版面重复拆分，除非该维度本身就要求这样做。
5. overview 用一句中文总结这次整理思路。
6. description 用一句中文说明该组为什么这样归类。
7. 输出必须严格使用给定 schema。

帖子列表：
${topicText}`,
    });

    return NextResponse.json(sanitizePlan(object, topics));
  } catch (error) {
    console.error("AI 整理收藏失败:", error);
    return NextResponse.json(
      {
        error: "AI 整理收藏失败，请稍后重试。",
      },
      { status: 500 }
    );
  }
}

export const POST = withCors(handler);
export const OPTIONS = withCors(async () => NextResponse.json({}));
