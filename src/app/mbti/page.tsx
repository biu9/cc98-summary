"use client";

import { useEffect, useMemo } from "react";
import LoadingButton from "@mui/lab/LoadingButton";
import { Alert, Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import { PsychologyRounded, VerifiedRounded } from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "react-oidc-context";
import { CsrPageFallback } from "@/components/CsrPageFallback";
import { MBTIResultCard } from "@/components/mbti-result-card";
import { SiteNav } from "@/components/SiteNav";
import { useFeedback, useUserInfo } from "@/store/globalStore";
import { useMBTIStore } from "@/store/mbtiStore";

const processCards = [
  {
    title: "同步资料",
    description: "先读取当前账号资料。",
  },
  {
    title: "读取发帖",
    description: "分析基于论坛行为。",
  },
  {
    title: "生成结果",
    description: "直接输出 MBTI 结果卡。",
  },
];

function MBTIPage() {
  const auth = useAuth();
  const { feedback, setFeedback, clearFeedback } = useFeedback();
  const {
    userInfo,
    loading: userInfoLoading,
    error: userInfoError,
    fetchUserInfo,
  } = useUserInfo();
  const { mbti, loading, handleMBTITest } = useMBTIStore();

  const accessToken = useMemo(
    () => auth.user?.access_token,
    [auth.user?.access_token]
  );

  useEffect(() => {
    if (auth.isAuthenticated && accessToken && !userInfo && !userInfoLoading) {
      void fetchUserInfo(accessToken);
    }
  }, [accessToken, auth.isAuthenticated, fetchUserInfo, userInfo, userInfoLoading]);

  useEffect(() => {
    if (userInfoError) {
      setFeedback(userInfoError);
    }
  }, [setFeedback, userInfoError]);

  const handleClick = async () => {
    if (!accessToken) {
      setFeedback("访问令牌无效，请重新登录后再试。");
      return;
    }

    if (!userInfo) {
      setFeedback("用户信息尚未加载完成，请稍后重试。");
      return;
    }

    await handleMBTITest(accessToken, setFeedback);
  };

  if (auth.isLoading) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="mbti" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">MBTI</p>
            <h1 className="section-title text-slate-900">正在确认你的登录状态</h1>
            <p className="section-description mx-auto">稍后会自动同步你的资料。</p>
          </div>
        </main>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="mbti" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">MBTI</p>
            <h1 className="section-title text-slate-900">登录后才能开始分析</h1>
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

  if (userInfoLoading && !userInfo) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="mbti" />
          <div className="panel mx-auto max-w-3xl px-8 py-16 text-center">
            <p className="kicker mx-auto w-fit">CC98 /me</p>
            <h1 className="section-title text-slate-900">正在同步当前用户信息</h1>
            <p className="section-description mx-auto">同步完成后即可开始分析。</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="mbti" />

        {feedback && (
          <Alert severity="error" onClose={clearFeedback} className="mb-6">
            {feedback}
          </Alert>
        )}

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.15fr) 360px" },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<PsychologyRounded />}
                label="MBTI 分析"
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
                  sx={{ fontSize: { xs: "2.2rem", md: "3rem" } }}
                >
                  从你的发帖风格里提炼 MBTI 画像。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  不走问卷，直接基于论坛行为生成结果。
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
                    label: "当前用户",
                    value: userInfo?.name ?? "--",
                    hint: "已通过 /me 同步",
                  },
                  {
                    label: "发帖数",
                    value: userInfo?.postCount?.toLocaleString("zh-CN") ?? "--",
                    hint: "用于行为分析",
                  },
                  {
                    label: "威望",
                    value: userInfo?.prestige?.toLocaleString("zh-CN") ?? "--",
                    hint: "社区影响力",
                  },
                  {
                    label: "状态",
                    value: mbti ? "已生成" : "待分析",
                    hint: "可随时重新测试",
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

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <LoadingButton
                  loading={loading}
                  onClick={handleClick}
                  disabled={!userInfo}
                  variant="contained"
                >
                  {mbti ? "重新生成分析" : "开始 MBTI 分析"}
                </LoadingButton>
                <Button component={Link} href="/summary" variant="outlined">
                  试试帖子问答
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: "0.24em", fontWeight: 700 }}
              >
                分析流程
              </Typography>
              <Stack spacing={1.5}>
                {processCards.map((item, index) => (
                  <Paper
                    key={item.title}
                    variant="outlined"
                    sx={{ px: 2.5, py: 2.5, bgcolor: "rgba(17,17,17,0.02)" }}
                  >
                    <Typography className="mono" variant="caption" color="text.secondary">
                      Step 0{index + 1}
                    </Typography>
                    <Typography mt={1.5} variant="h6" fontWeight={700}>
                      {item.title}
                    </Typography>
                    <Typography mt={1} variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Paper
                variant="outlined"
                sx={{ px: 2.5, py: 2.5, bgcolor: "rgba(17,17,17,0.03)" }}
              >
                <Stack spacing={2}>
                  <Typography fontWeight={700}>
                    <VerifiedRounded className="mr-2 align-[-4px]" />
                    与首页共用同一份资料
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1.5}>
                    <Button component={Link} href="/favorites" variant="outlined">
                      整理收藏
                    </Button>
                    <Button component={Link} href="/summary" variant="outlined">
                      去问答
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Box>

        <Paper className="mui-light-panel" sx={{ mt: 3, px: { xs: 2, md: 4 }, py: { xs: 2, md: 4 } }}>
          {!mbti ? (
            <div className="mx-auto max-w-3xl px-2 py-6 text-center">
              <p className="kicker mx-auto w-fit">准备开始</p>
              <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900">
                开始生成你的论坛人格结果
              </h2>
              <LoadingButton
                loading={loading}
                onClick={handleClick}
                disabled={!userInfo}
                className="button-dark mt-8 !px-6 !py-3 !text-sm !font-bold !normal-case"
              >
                立即开始分析
              </LoadingButton>
            </div>
          ) : (
            <div className="space-y-6">
              <MBTIResultCard results={mbti} userName={userInfo?.name} />
              <div className="flex justify-center">
                <LoadingButton
                  loading={loading}
                  onClick={handleClick}
                  disabled={!userInfo}
                  className="button-secondary !px-6 !py-3 !text-sm !font-bold !normal-case"
                >
                  重新测试
                </LoadingButton>
              </div>
            </div>
          )}
        </Paper>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(MBTIPage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="mbti" title="正在加载 MBTI 页面" />
  ),
});

