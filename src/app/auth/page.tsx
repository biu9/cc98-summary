"use client";

import Link from "next/link";
import { Alert } from "@mui/material";
import dynamic from "next/dynamic";
import {
  ArrowOutwardRounded,
  PersonAddAltRounded,
  ShieldRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "react-oidc-context";
import { CsrPageFallback } from "@/components/CsrPageFallback";
import { SiteNav } from "@/components/SiteNav";

const REGISTER_URL = "https://www.cc98.org/";

function AuthPage() {
  const auth = useAuth();

  const handleSignIn = () => {
    void auth.signinRedirect();
  };

  if (auth.isLoading) {
    return (
      <div className="page-root">
        <main className="page-container">
          <SiteNav current="auth" />
          <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-3xl items-center justify-center">
            <Paper
              className="mui-light-panel"
              sx={{ width: "100%", p: 5, textAlign: "center" }}
            >
              <Stack spacing={2} alignItems="center">
                <Chip label="CC98 Agent" variant="outlined" />
                <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em">
                  正在准备认证页
                </Typography>
                <Typography color="text.secondary">
                  稍后即可进入登录或注册。
                </Typography>
              </Stack>
            </Paper>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="auth" />

        {auth.error && (
          <Alert severity="error" className="mb-6">
            登录失败：{auth.error.message}
          </Alert>
        )}

        <Box
          component="section"
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: { xs: "1fr", lg: "minmax(0,1.15fr) 380px" },
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
                  sx={{ fontSize: { xs: "2.5rem", md: "3.2rem" } }}
                >
                  登录和注册都放在这里。
                </Typography>
                <Typography mt={2} color="rgba(255,255,255,0.72)">
                  授权完成后首页会自动同步你的账号资料。
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                  }}
                >
                  <Stack spacing={2.5}>
                    <Chip
                      icon={<VerifiedRounded />}
                      label="登录"
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "#ffffff",
                        "& .MuiChip-icon": { color: "#ffffff" },
                      }}
                    />
                    <Typography color="rgba(255,255,255,0.72)">
                      使用 CC98 授权进入应用。
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={handleSignIn}
                      endIcon={<ArrowOutwardRounded />}
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: "#ffffff",
                        color: "#111111",
                        "&:hover": { bgcolor: "#f4f4f5" },
                      }}
                    >
                      使用 CC98 授权登录
                    </Button>
                  </Stack>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    bgcolor: "rgba(255,255,255,0.04)",
                    borderColor: "rgba(255,255,255,0.12)",
                    color: "#ffffff",
                  }}
                >
                  <Stack spacing={2.5}>
                    <Chip
                      icon={<PersonAddAltRounded />}
                      label="注册"
                      sx={{
                        alignSelf: "flex-start",
                        bgcolor: "rgba(255,255,255,0.08)",
                        color: "#ffffff",
                        "& .MuiChip-icon": { color: "#ffffff" },
                      }}
                    />
                    <Typography color="rgba(255,255,255,0.72)">
                      没有账号就先去 CC98 主站注册。
                    </Typography>
                    <Button
                      component="a"
                      href={REGISTER_URL}
                      target="_blank"
                      rel="noreferrer"
                      variant="outlined"
                      endIcon={<ArrowOutwardRounded />}
                      sx={{
                        alignSelf: "flex-start",
                        color: "#ffffff",
                        borderColor: "rgba(255,255,255,0.2)",
                        "&:hover": {
                          borderColor: "rgba(255,255,255,0.32)",
                          bgcolor: "rgba(255,255,255,0.04)",
                        },
                      }}
                    >
                      前往 CC98 主站
                    </Button>
                  </Stack>
                </Paper>
              </Box>
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
                  认证状态
                </Typography>
                <Typography variant="h4" mt={1.5} fontWeight={700}>
                  {auth.isAuthenticated ? "你已经登录" : "先登录，再进入功能页"}
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {[
                  "1. 登录使用 CC98 授权",
                  "2. 首页会自动同步 /me",
                  "3. 注册需要先去 CC98 主站",
                ].map((item) => (
                  <Paper
                    key={item}
                    variant="outlined"
                    sx={{ px: 2, py: 1.5, bgcolor: "rgba(17,17,17,0.02)" }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      {item}
                    </Typography>
                  </Paper>
                ))}
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Button component={Link} href="/" variant="contained">
                  返回首页
                </Button>
                {auth.isAuthenticated && (
                  <Button component={Link} href="/" variant="outlined">
                    进入首页
                  </Button>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Box>
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(AuthPage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="auth" title="正在加载认证页" />
  ),
});

