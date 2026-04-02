"use client";

import type { ElementType } from "react";
import type { IUser } from "@cc98/api";
import Link from "next/link";
import {
  ArrowOutwardRounded,
  AutoAwesomeRounded,
  CollectionsBookmarkRounded,
  ForumRounded,
  PsychologyRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import { Avatar, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { MAX_CALL_PER_USER } from "../../config";
import { SiteNav } from "@/components/SiteNav";

interface AuthenticatedAppProps {
  currCount: number;
  userInfo: IUser | null;
  userInfoLoading: boolean;
}

interface FeatureCard {
  title: string;
  description: string;
  href: string;
  icon: ElementType;
  status: string;
}

const featureCards: FeatureCard[] = [
  {
    title: "帖子问答",
    description: "选一个收藏分组，直接围绕帖子提问。",
    href: "/summary",
    icon: ForumRounded,
    status: "已开放",
  },
  {
    title: "收藏整理",
    description: "输入维度后，AI 预览并重分组收藏帖子。",
    href: "/favorites",
    icon: CollectionsBookmarkRounded,
    status: "已开放",
  },
  {
    title: "MBTI 画像",
    description: "根据发帖行为生成论坛人格画像。",
    href: "/mbti",
    icon: PsychologyRounded,
    status: "可直接体验",
  },
  {
    title: "自由聊天",
    description: "不绑定知识库，直接进入通用对话。",
    href: "/chat",
    icon: AutoAwesomeRounded,
    status: "已开放",
  },
];

const formatNumber = (value?: number | null) => {
  if (value == null) {
    return "--";
  }

  return new Intl.NumberFormat("zh-CN").format(value);
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "未记录";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2,
        py: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        bgcolor: "rgba(17,17,17,0.02)",
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function AuthenticatedApp({
  currCount,
  userInfo,
  userInfoLoading,
}: AuthenticatedAppProps) {
  const remainingQuota = Math.max(0, MAX_CALL_PER_USER - currCount);
  const avatarSrc = userInfo?.portraitUrl || userInfo?.photourl;
  const profileTitle =
    userInfo?.customTitle?.trim() ||
    userInfo?.displayTitle?.trim() ||
    userInfo?.privilege ||
    "CC98 用户";
  const introduction =
    userInfo?.introduction?.trim() || "资料已同步，可以直接进入常用功能。";
  const stats = [
    {
      label: "今日剩余",
      value: `${remainingQuota}/${MAX_CALL_PER_USER}`,
      hint: "AI 配额",
    },
    {
      label: "发帖数",
      value: formatNumber(userInfo?.postCount),
      hint: "累计发帖",
    },
    {
      label: "威望",
      value: formatNumber(userInfo?.prestige),
      hint: "社区影响力",
    },
    {
      label: "财富",
      value: formatNumber(userInfo?.wealth),
      hint: "账号财富值",
    },
  ];

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="home" />

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_360px]">
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<VerifiedRounded />}
                label={userInfoLoading && !userInfo ? "正在同步 /me" : "当前用户已同步"}
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
                  sx={{ fontSize: { xs: "2.4rem", md: "3.4rem" }, maxWidth: 860 }}
                >
                  {userInfo
                    ? `${userInfo.name}，今天想从哪里开始？`
                    : "资料正在同步，马上就能开始使用。"}
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  {userInfo
                    ? "用户资料和今日配额都已经准备好。"
                    : "授权完成后会自动读取当前账号信息。"}
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
                {stats.map((stat) => (
                  <Paper
                    key={stat.label}
                    variant="outlined"
                    sx={{
                      px: 2.25,
                      py: 2.5,
                      bgcolor: "rgba(255,255,255,0.04)",
                      borderColor: "rgba(255,255,255,0.12)",
                      color: "#ffffff",
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
                    <Typography mt={1.5} variant="h4" fontWeight={700}>
                      {stat.value}
                    </Typography>
                    <Typography mt={1} color="rgba(255,255,255,0.58)">
                      {stat.hint}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Button
                  component={Link}
                  href="/summary"
                  variant="contained"
                  endIcon={<ArrowOutwardRounded />}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#111111",
                    "&:hover": { bgcolor: "#f4f4f5" },
                  }}
                >
                  打开帖子问答
                </Button>
                <Button
                  component={Link}
                  href="/favorites"
                  variant="outlined"
                  endIcon={<ArrowOutwardRounded />}
                  sx={{
                    color: "#ffffff",
                    borderColor: "rgba(255,255,255,0.2)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.3)",
                      bgcolor: "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  整理收藏夹
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ letterSpacing: "0.24em", fontWeight: 700 }}
                >
                  当前用户
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar
                  src={avatarSrc ?? undefined}
                  alt={userInfo?.name ?? "CC98 用户头像"}
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: "#111111" }}
                >
                  {userInfo?.name?.slice(0, 1) ?? "?"}
                </Avatar>

                <Box minWidth={0}>
                  <Typography variant="h4" fontWeight={700} noWrap>
                    {userInfo?.name ?? "正在获取用户名"}
                  </Typography>
                  <Typography mt={0.5} color="text.secondary" noWrap>
                    {profileTitle}
                  </Typography>
                </Box>
              </Stack>

              <Paper
                variant="outlined"
                sx={{ px: 2, py: 2, bgcolor: "rgba(17,17,17,0.03)" }}
              >
                <Typography variant="body2" color="text.secondary" lineHeight={1.9}>
                  {introduction}
                </Typography>
              </Paper>

              <Stack spacing={1.5}>
                <ProfileRow
                  label="UID"
                  value={userInfo ? `#${userInfo.id}` : "同步中"}
                />
                <ProfileRow
                  label="粉丝 / 关注"
                  value={
                    userInfo
                      ? `${formatNumber(userInfo.fanCount)} / ${formatNumber(
                          userInfo.followCount
                        )}`
                      : "同步中"
                  }
                />
                <ProfileRow
                  label="注册时间"
                  value={formatDate(userInfo?.registerTime)}
                />
                <ProfileRow
                  label="最后登录"
                  value={formatDate(userInfo?.lastLogOnTime)}
                />
              </Stack>
            </Stack>
          </Paper>
        </section>

        <Box
          component="section"
          sx={{
            mt: 3,
            display: "grid",
            gap: 2,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0,1fr))",
              xl: "repeat(4, minmax(0,1fr))",
            },
          }}
        >
          {featureCards.map((feature) => {
            const Icon = feature.icon;

            return (
              <Paper
                key={feature.title}
                component={Link}
                href={feature.href}
                className="mui-light-panel"
                sx={{
                  p: 3,
                  textDecoration: "none",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-3px)",
                    boxShadow: "0 18px 48px rgba(15,23,42,0.08)",
                  },
                }}
              >
                <Stack spacing={2.5} height="100%">
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Chip
                      icon={<Icon />}
                      label={feature.title}
                      sx={{ bgcolor: "rgba(17,17,17,0.03)" }}
                    />
                    <Chip label={feature.status} variant="outlined" />
                  </Stack>

                  <Typography variant="body2" color="text.secondary" flex={1}>
                    {feature.description}
                  </Typography>

                  <Button
                    component="span"
                    variant="text"
                    endIcon={<ArrowOutwardRounded />}
                    sx={{
                      alignSelf: "flex-start",
                      px: 0,
                      minHeight: 0,
                      color: "#111111",
                      "&:hover": { bgcolor: "transparent" },
                    }}
                  >
                    立即进入
                  </Button>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </main>
    </div>
  );
}

