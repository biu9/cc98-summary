"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AutoAwesomeRounded,
  CollectionsBookmarkRounded,
  ForumRounded,
  RefreshRounded,
  SaveRounded,
  SubdirectoryArrowRightRounded,
} from "@mui/icons-material";
import type { ITopic, ITopicGroup } from "@cc98/api";
import { useAuth } from "react-oidc-context";
import { CsrPageFallback } from "@/components/CsrPageFallback";
import { SiteNav } from "@/components/SiteNav";
import type {
  IOrganizedFavoriteGroupView,
  IOrganizedFavoritePlan,
  IOrganizeFavoriteTopicInput,
} from "@/app/favorites/types";
import { POST } from "@/request";
import { useFeedback } from "@/store/globalStore";
import { KnowledgeBaseManager } from "@/utils/knowledgeBaseManager";
import { securityFilter } from "@/utils/securityFilter";
import {
  getAFavouriteTopicContent,
  getFavouriteTopicGroup,
} from "@/utils/getFavouriteTopic";

const organizeExamples = [
  "按话题领域整理",
  "按回看价值整理",
  "按学习 / 资料 / 讨论整理",
  "按情绪氛围整理",
];

interface FavoriteTopicWithSource extends ITopic {
  sourceGroupNames: string[];
}

function sanitizePreview(value?: string | null) {
  if (!value) {
    return "";
  }

  return securityFilter(value)
    .replace(/\[[^\]]+\]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}

function dedupeTopics(topics: FavoriteTopicWithSource[]) {
  const topicMap = new Map<number, FavoriteTopicWithSource>();

  topics.forEach((topic) => {
    const existingTopic = topicMap.get(topic.id);

    if (!existingTopic) {
      topicMap.set(topic.id, {
        ...topic,
        sourceGroupNames: [...topic.sourceGroupNames],
      });
      return;
    }

    topicMap.set(topic.id, {
      ...existingTopic,
      sourceGroupNames: Array.from(
        new Set([...existingTopic.sourceGroupNames, ...topic.sourceGroupNames])
      ),
    });
  });

  return Array.from(topicMap.values());
}

function buildKnowledgeBaseName(baseName: string) {
  let name = baseName.trim();
  let index = 2;

  while (KnowledgeBaseManager.isNameExists(name)) {
    name = `${baseName} ${index}`;
    index += 1;
  }

  return name;
}

function FavoritesPage() {
  const auth = useAuth();
  const router = useRouter();
  const { feedback, clearFeedback, setFeedback } = useFeedback();
  const [groups, setGroups] = useState<ITopicGroup[]>([]);
  const [topicsByGroup, setTopicsByGroup] = useState<Record<number, ITopic[]>>(
    {}
  );
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [organizing, setOrganizing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [scope, setScope] = useState<string>("all");
  const [dimension, setDimension] = useState("按话题领域整理");
  const [organizedPlan, setOrganizedPlan] =
    useState<IOrganizedFavoritePlan | null>(null);
  const [organizedGroups, setOrganizedGroups] = useState<
    IOrganizedFavoriteGroupView[]
  >([]);
  const [appliedKnowledgeBaseIds, setAppliedKnowledgeBaseIds] = useState<
    Record<string, string>
  >(
    {}
  );
  const accessToken = auth.user?.access_token;

  const totalLoadedTopics = useMemo(
    () =>
      dedupeTopics(
        Object.entries(topicsByGroup).flatMap(([groupId, topics]) => {
          const groupName =
            groups.find((item) => item.id === Number(groupId))?.name ?? "未命名分组";

          return topics.map((topic) => ({
            ...topic,
            sourceGroupNames: [groupName],
          }));
        })
      ).length,
    [groups, topicsByGroup]
  );

  const selectedScopeLabel =
    scope === "all"
      ? "全部收藏"
      : groups.find((group) => group.id === Number(scope))?.name ?? "当前分组";

  const loadGroups = useCallback(async () => {
    if (!accessToken) {
      return;
    }

    setGroupsLoading(true);

    try {
      const favoriteGroups = await getFavouriteTopicGroup(accessToken);
      setGroups(favoriteGroups);
    } catch (error) {
      console.error("加载收藏分组失败:", error);
      setFeedback("加载收藏分组失败，请稍后重试。");
      setGroups([]);
    } finally {
      setGroupsLoading(false);
    }
  }, [accessToken, setFeedback]);

  const loadTopicsForGroup = async (group: ITopicGroup) => {
    if (!accessToken) {
      throw new Error("未找到访问令牌，请重新登录。");
    }

    if (topicsByGroup[group.id]) {
      return topicsByGroup[group.id];
    }

    const topics = await getAFavouriteTopicContent(group, accessToken);
    setTopicsByGroup((current) => ({
      ...current,
      [group.id]: topics,
    }));

    return topics;
  };

  const ensureScopeTopics = async () => {
    const scopedGroups =
      scope === "all"
        ? groups
        : groups.filter((group) => group.id === Number(scope));

    const topicGroups = await Promise.all(
      scopedGroups.map(async (group) => {
        const topics = topicsByGroup[group.id] ?? (await loadTopicsForGroup(group));

        return topics.map((topic) => ({
          ...topic,
          sourceGroupNames: [group.name],
        }));
      })
    );

    return dedupeTopics(topicGroups.flat());
  };

  const materializePlan = (
    plan: IOrganizedFavoritePlan,
    topics: FavoriteTopicWithSource[]
  ) => {
    const topicMap = new Map(topics.map((topic) => [topic.id, topic]));

    return plan.groups
      .map((group) => ({
        ...group,
        topics: group.topicIds
          .map((topicId) => topicMap.get(topicId))
          .filter((topic): topic is FavoriteTopicWithSource => Boolean(topic)),
      }))
      .filter((group) => group.topics.length > 0);
  };

  const saveAsKnowledgeBase = (group: IOrganizedFavoriteGroupView) => {
    const baseName = `${dimension.trim()} · ${group.name}`;
    const knowledgeBase = KnowledgeBaseManager.create(
      buildKnowledgeBaseName(baseName),
      `AI 按“${dimension.trim()}”整理得到的收藏分组。`,
      group.topics.map((topic) => ({
        id: topic.id,
        label: topic.title,
        replyCount: topic.replyCount,
      }))
    );

    const saved = KnowledgeBaseManager.save(knowledgeBase);

    if (!saved) {
      setFeedback("保存知识库失败，请稍后重试。");
      return null;
    }

    return knowledgeBase.id;
  };

  const handleOrganize = async () => {
    if (!dimension.trim()) {
      setFeedback("请输入整理维度。");
      return;
    }

    if (groups.length === 0) {
      setFeedback("还没有可整理的收藏分组。");
      return;
    }

    setOrganizing(true);
    setAppliedKnowledgeBaseIds({});

    try {
      const scopedTopics = await ensureScopeTopics();

      if (scopedTopics.length === 0) {
        setFeedback("当前范围内没有可整理的收藏帖子。");
        setOrganizedPlan(null);
        setOrganizedGroups([]);
        return;
      }

      const payloadTopics: IOrganizeFavoriteTopicInput[] = scopedTopics.map(
        (topic) => ({
          id: topic.id,
          title: topic.title,
          boardName: topic.boardName,
          userName: topic.userName,
          replyCount: topic.replyCount,
          likeCount: topic.likeCount,
          hitCount: topic.hitCount,
          lastPostTime: topic.lastPostTime,
          preview: sanitizePreview(topic.lastPostContent),
          sourceGroupName: topic.sourceGroupNames.join("、"),
        })
      );

      const plan = await POST<
        {
          dimension: string;
          sourceLabel: string;
          topics: IOrganizeFavoriteTopicInput[];
        },
        IOrganizedFavoritePlan
      >("/api/favorites/organize", {
        dimension: dimension.trim(),
        sourceLabel: selectedScopeLabel,
        topics: payloadTopics,
      });

      setOrganizedPlan(plan);
      setOrganizedGroups(materializePlan(plan, scopedTopics));
      setFeedback("AI 已生成预览分组，请确认后再应用。");
    } catch (error) {
      console.error("AI 整理收藏失败:", error);
      setFeedback("AI 整理收藏失败，请稍后重试。");
      setOrganizedPlan(null);
      setOrganizedGroups([]);
    } finally {
      setOrganizing(false);
    }
  };

  const handleApplyOrganize = () => {
    if (organizedGroups.length === 0) {
      setFeedback("请先生成预览分组。");
      return;
    }

    setApplying(true);

    try {
      const nextKnowledgeBaseIds: Record<string, string> = {};

      organizedGroups.forEach((group) => {
        const knowledgeBaseId = saveAsKnowledgeBase(group);

        if (!knowledgeBaseId) {
          throw new Error("保存知识库失败");
        }

        nextKnowledgeBaseIds[group.name] = knowledgeBaseId;
      });

      setAppliedKnowledgeBaseIds(nextKnowledgeBaseIds);
      setFeedback(`已应用 ${organizedGroups.length} 个新分组。`);
    } catch (error) {
      console.error("应用重分组失败:", error);
      setFeedback("应用重分组失败，请稍后重试。");
      setAppliedKnowledgeBaseIds({});
    } finally {
      setApplying(false);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated && accessToken) {
      void loadGroups();
    }
  }, [accessToken, auth.isAuthenticated, loadGroups]);

  useEffect(() => {
    setOrganizedPlan(null);
    setOrganizedGroups([]);
    setAppliedKnowledgeBaseIds({});
  }, [dimension, scope]);

  if (auth.isLoading) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="favorites" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">收藏整理</p>
            <h1 className="section-title text-slate-900">正在确认登录状态</h1>
            <p className="section-description mx-auto">稍后会自动读取你的收藏。</p>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="favorites" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">收藏整理</p>
            <h1 className="section-title text-slate-900">登录后才能整理收藏夹</h1>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/auth" className="button-primary">
                前往认证页
              </Link>
              <Link href="/" className="button-secondary">
                返回首页
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="favorites" />

        {feedback && (
          <Alert severity="info" onClose={clearFeedback} className="mb-6">
            {feedback}
          </Alert>
        )}

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.12fr) 360px" },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<AutoAwesomeRounded />}
                label="AI 收藏整理"
                variant="outlined"
                sx={{
                  alignSelf: "flex-start",
                  color: "#e4e4e7",
                  borderColor: "rgba(255,255,255,0.14)",
                  bgcolor: "rgba(255,255,255,0.04)",
                  "& .MuiChip-icon": { color: "#ffffff" },
                }}
              />

              <Box>
                <Typography
                  variant="h2"
                  fontWeight={700}
                  letterSpacing="-0.04em"
                  sx={{ fontSize: { xs: "2.3rem", md: "3.2rem" }, maxWidth: 900 }}
                >
                  输入一个维度，让 AI 自动重新分组已收藏帖子。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  先生成预览，确认后再应用到新分组。
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0,1fr))",
                    xl: "repeat(4, minmax(0,1fr))",
                  },
                }}
              >
                {[
                  {
                    label: "收藏分组",
                    value: groups.length,
                    hint: "原始分组数量",
                  },
                  {
                    label: "已加载帖子",
                    value: totalLoadedTopics,
                    hint: "当前缓存中的收藏帖",
                  },
                  {
                    label: "整理范围",
                    value: selectedScopeLabel,
                    hint: "本次 AI 输入范围",
                  },
                  {
                    label: "状态",
                    value: organizing
                      ? "预览中"
                      : applying
                        ? "应用中"
                        : Object.keys(appliedKnowledgeBaseIds).length > 0
                          ? "已应用"
                          : organizedGroups.length > 0
                            ? "待确认"
                            : "待开始",
                    hint:
                      Object.keys(appliedKnowledgeBaseIds).length > 0
                        ? `已保存 ${Object.keys(appliedKnowledgeBaseIds).length} 组`
                        : organizedGroups.length > 0
                          ? `${organizedGroups.length} 个新分组`
                          : "输入维度即可开始",
                  },
                ].map((stat) => (
                  <Paper
                    key={stat.label}
                    variant="outlined"
                    sx={{
                      px: 2.25,
                      py: 2.5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.12)",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: "0.24em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.58)",
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography mt={1.5} variant="h5" fontWeight={700} color="#ffffff">
                      {stat.value}
                    </Typography>
                    <Typography mt={1} color="rgba(255,255,255,0.58)">
                      {stat.hint}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: "0.24em", fontWeight: 700 }}
              >
                整理设置
              </Typography>

              <TextField
                select
                label="整理范围"
                value={scope}
                onChange={(event) => setScope(event.target.value)}
                fullWidth
              >
                <MenuItem value="all">全部收藏</MenuItem>
                {groups.map((group) => (
                  <MenuItem key={group.id} value={String(group.id)}>
                    {group.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="整理维度"
                value={dimension}
                onChange={(event) => setDimension(event.target.value)}
                placeholder="例如：按话题领域、按用途价值、按回看优先级整理"
                fullWidth
                multiline
                minRows={5}
              />

              <Stack direction="row" flexWrap="wrap" gap={1}>
                {organizeExamples.map((example) => (
                  <Chip
                    key={example}
                    label={example}
                    variant="outlined"
                    onClick={() => setDimension(example)}
                  />
                ))}
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Button
                  type="button"
                  onClick={() => void handleOrganize()}
                  disabled={groupsLoading || organizing || applying}
                  variant="contained"
                  startIcon={
                    organizing ? (
                      <CircularProgress size={16} sx={{ color: "white" }} />
                    ) : (
                      <AutoAwesomeRounded />
                    )
                  }
                >
                  {organizing
                    ? "生成预览中"
                    : organizedGroups.length > 0
                      ? "重新生成预览"
                      : "开始整理"}
                </Button>
                <Button
                  type="button"
                  onClick={handleApplyOrganize}
                  disabled={
                    organizedGroups.length === 0 ||
                    organizing ||
                    applying ||
                    Object.keys(appliedKnowledgeBaseIds).length > 0
                  }
                  variant="outlined"
                  startIcon={
                    applying ? <CircularProgress size={16} /> : <SaveRounded />
                  }
                >
                  {applying
                    ? "应用中"
                    : Object.keys(appliedKnowledgeBaseIds).length > 0
                      ? "已应用"
                      : "确认并应用"}
                </Button>
                <Button
                  type="button"
                  onClick={() => void loadGroups()}
                  disabled={groupsLoading || organizing || applying}
                  variant="outlined"
                  startIcon={
                    groupsLoading ? <CircularProgress size={16} /> : <RefreshRounded />
                  }
                >
                  {groupsLoading ? "刷新中" : "刷新收藏"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="panel rounded-[14px] p-5">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  原始收藏
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  来源分组
                </h2>
              </div>
              <div className="mono text-xs text-slate-500">{groups.length} 组</div>
            </div>

            <div className="mt-4 space-y-3">
              {groupsLoading ? (
                <div className="flex min-h-[220px] items-center justify-center text-sm text-slate-500">
                  <CircularProgress size={20} />
                </div>
              ) : groups.length === 0 ? (
                <div className="rounded-[10px] border border-black/10 bg-[#fafafa] px-4 py-6 text-sm text-slate-600">
                  还没有收藏分组。
                </div>
              ) : (
                groups.map((group) => {
                  const selected = scope !== "all" && Number(scope) === group.id;

                  return (
                    <button
                      key={group.id}
                      type="button"
                      onClick={() => setScope(String(group.id))}
                      className={`w-full rounded-[10px] border px-4 py-4 text-left transition ${
                        selected
                          ? "border-black bg-[#111111] text-white"
                          : "border-black/10 bg-white hover:bg-[#fafafa]"
                      }`}
                    >
                      <div className="text-base font-semibold">{group.name}</div>
                      <div
                        className={`mt-2 text-sm ${
                          selected ? "text-zinc-300" : "text-slate-600"
                        }`}
                      >
                        {group.count} 个帖子
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="panel rounded-[14px] p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/10 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  AI 结果
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">
                  {organizedPlan
                    ? Object.keys(appliedKnowledgeBaseIds).length > 0
                      ? "已应用的新分组"
                      : "预览分组"
                    : "等待开始整理"}
                </h2>
              </div>
              {organizedPlan && (
                <div className="max-w-xl text-sm text-slate-600">
                  {organizedPlan.overview}
                  {Object.keys(appliedKnowledgeBaseIds).length === 0 &&
                    " 当前还是预览，确认后才会真正应用。"}
                </div>
              )}
            </div>

            {!organizedPlan ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-[10px] bg-[#111111] text-white">
                  <CollectionsBookmarkRounded className="text-[1.8rem]" />
                </div>
                <h3 className="mt-6 text-2xl font-semibold text-slate-900">
                  还没有 AI 分组结果
                </h3>
                <p className="mt-3 max-w-xl text-sm text-slate-600">
                  输入一个整理维度，例如“按话题领域整理”或“按回看价值整理”。
                </p>
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {organizedGroups.map((group) => (
                  <article
                    key={group.name}
                    className="rounded-[12px] border border-black/10 bg-[#fafafa] p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {group.name}
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          {group.description}
                        </p>
                      </div>
                      <span className="mono rounded-[8px] border border-black/10 bg-white px-3 py-1 text-xs text-slate-600">
                        {group.topics.length} 帖
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      {group.topics.slice(0, 6).map((topic) => (
                        <div
                          key={topic.id}
                          className="rounded-[8px] border border-black/10 bg-white px-3 py-3"
                        >
                          <div className="line-clamp-2 text-sm font-semibold text-slate-900">
                            {topic.title}
                          </div>
                          <div className="mt-2 text-xs text-slate-500">
                            {topic.boardName}
                            {" · "}
                            {topic.sourceGroupNames.join("、")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {group.topics.length > 6 && (
                      <div className="mt-3 text-xs text-slate-500">
                        还有 {group.topics.length - 6} 个帖子未展开
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-3">
                      {appliedKnowledgeBaseIds[group.name] ? (
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/summary?kb=${appliedKnowledgeBaseIds[group.name]}`
                            )
                          }
                          className="button-dark"
                        >
                          <ForumRounded className="text-[1rem]" />
                          进入问答
                        </button>
                      ) : (
                        <div className="button-secondary">预览中，待确认应用</div>
                      )}
                    </div>

                    {Object.keys(appliedKnowledgeBaseIds).length > 0 && (
                      <div className="mt-3 text-xs text-slate-500">
                        已保存为知识库，可直接进入问答
                      </div>
                    )}

                    <div className="mt-4 space-y-2">
                      {group.topics.slice(0, 3).map((topic) => (
                        <a
                          key={`link-${topic.id}`}
                          href={`https://www.cc98.org/topic/${topic.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-slate-700 underline-offset-4 hover:underline"
                        >
                          <SubdirectoryArrowRightRounded className="text-[1rem]" />
                          打开原帖
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(FavoritesPage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="favorites" title="正在加载收藏整理页" />
  ),
});
