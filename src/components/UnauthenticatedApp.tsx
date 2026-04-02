"use client";

import type { ElementType } from "react";
import Link from "next/link";
import {
  ArrowOutwardRounded,
  AutoAwesomeRounded,
  CollectionsBookmarkRounded,
  ForumRounded,
  PersonAddAltRounded,
  PsychologyRounded,
  ShieldRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { SiteNav } from "@/components/SiteNav";

interface ProductCard {
  title: string;
  description: string;
  icon: ElementType;
}

const steps: ProductCard[] = [
  {
    title: "独立登录",
    description: "登录和注册都集中在 /auth。",
    icon: ShieldRounded,
  },
  {
    title: "/me 同步",
    description: "登录后首页自动带出账号资料。",
    icon: VerifiedRounded,
  },
  {
    title: "直接使用",
    description: "进入 MBTI、问答和收藏整理。",
    icon: AutoAwesomeRounded,
  },
];

const products: ProductCard[] = [
  {
    title: "MBTI",
    description: "根据发帖行为生成论坛人格画像。",
    icon: PsychologyRounded,
  },
  {
    title: "收藏整理",
    description: "输入维度后，AI 重新分类已收藏帖子。",
    icon: CollectionsBookmarkRounded,
  },
  {
    title: "帖子问答",
    description: "围绕收藏内容直接提问和追问。",
    icon: ForumRounded,
  },
];

export default function UnauthenticatedApp() {
  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="home" />

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.12fr) 380px" },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<ShieldRounded />}
                label="CC98 Agent"
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
                  sx={{ fontSize: { xs: "2.6rem", md: "4rem" }, maxWidth: 860 }}
                >
                  登录后直接使用 MBTI、收藏整理和帖子问答。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  授权完成后首页会自动同步你的 CC98 资料。
                </Typography>
              </Box>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Button
                  component={Link}
                  href="/auth"
                  variant="contained"
                  endIcon={<ArrowOutwardRounded />}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#111111",
                    "&:hover": { bgcolor: "#f4f4f5" },
                  }}
                >
                  前往登录 / 注册
                </Button>
                <Button
                  component={Link}
                  href="/chat"
                  variant="outlined"
                  sx={{
                    color: "#ffffff",
                    borderColor: "rgba(255,255,255,0.2)",
                    "&:hover": {
                      borderColor: "rgba(255,255,255,0.3)",
                      bgcolor: "rgba(255,255,255,0.04)",
                    },
                  }}
                >
                  先看聊天页
                </Button>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0,1fr))" },
                }}
              >
                {steps.map((step) => {
                  const Icon = step.icon;

                  return (
                    <Paper
                      key={step.title}
                      variant="outlined"
                      sx={{
                        p: 2.5,
                        bgcolor: "rgba(255,255,255,0.04)",
                        borderColor: "rgba(255,255,255,0.12)",
                        color: "#ffffff",
                      }}
                    >
                      <Stack spacing={2}>
                        <Chip
                          icon={<Icon />}
                          label={step.title}
                          sx={{
                            alignSelf: "flex-start",
                            bgcolor: "rgba(255,255,255,0.08)",
                            color: "#ffffff",
                            "& .MuiChip-icon": { color: "#ffffff" },
                          }}
                        />
                        <Typography color="rgba(255,255,255,0.72)">
                          {step.description}
                        </Typography>
                      </Stack>
                    </Paper>
                  );
                })}
              </Box>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ letterSpacing: "0.24em", fontWeight: 700 }}
                  >
                    快速入口
                  </Typography>
                  <Typography variant="h4" mt={1.5} fontWeight={700}>
                    先完成认证
                  </Typography>
                </Box>
                <Chip label="/auth" color="primary" />
              </Stack>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Chip
                    icon={<VerifiedRounded />}
                    label="登录"
                    sx={{ alignSelf: "flex-start", bgcolor: "rgba(17,17,17,0.04)" }}
                  />
                  <Typography color="text.secondary">
                    使用 CC98 授权进入应用。
                  </Typography>
                  <Button component={Link} href="/auth" variant="contained" fullWidth>
                    打开认证页
                  </Button>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Chip
                    icon={<PersonAddAltRounded />}
                    label="可用功能"
                    sx={{ alignSelf: "flex-start", bgcolor: "rgba(17,17,17,0.04)" }}
                  />
                  <Stack spacing={1.5}>
                    {products.map((card) => {
                      const Icon = card.icon;

                      return (
                        <Paper
                          key={card.title}
                          variant="outlined"
                          sx={{
                            px: 2,
                            py: 1.75,
                            bgcolor: "rgba(17,17,17,0.02)",
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Chip
                              icon={<Icon />}
                              label={card.title}
                              sx={{ minWidth: 110, justifyContent: "flex-start" }}
                            />
                            <Typography variant="body2" color="text.secondary">
                              {card.description}
                            </Typography>
                          </Stack>
                        </Paper>
                      );
                    })}
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </Paper>
        </Box>
      </main>
    </div>
  );
}

