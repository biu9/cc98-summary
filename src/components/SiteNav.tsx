import Link from "next/link";
import {
  AutoAwesomeRounded,
  CollectionsBookmarkRounded,
  ForumRounded,
  HomeRounded,
  InsightsRounded,
  LockRounded,
  PsychologyRounded,
} from "@mui/icons-material";
import { Box, Button, Chip, Stack } from "@mui/material";

interface SiteNavProps {
  current:
    | "home"
    | "auth"
    | "favorites"
    | "mbti"
    | "summary"
    | "chat"
    | "api-docs";
}

const navItems = [
  { key: "home", href: "/", label: "首页", icon: HomeRounded },
  { key: "auth", href: "/auth", label: "登录", icon: LockRounded },
  {
    key: "favorites",
    href: "/favorites",
    label: "收藏",
    icon: CollectionsBookmarkRounded,
  },
  { key: "mbti", href: "/mbti", label: "MBTI", icon: PsychologyRounded },
  { key: "summary", href: "/summary", label: "问答", icon: ForumRounded },
  { key: "chat", href: "/chat", label: "聊天", icon: AutoAwesomeRounded },
  { key: "api-docs", href: "/api-docs", label: "文档", icon: InsightsRounded },
] as const;

export function SiteNav({ current }: SiteNavProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Chip
        component={Link}
        href="/"
        clickable
        label={
          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
            <span className="mono text-xs uppercase tracking-[0.24em] text-slate-500">
              CC98
            </span>
            <span className="text-slate-900">Agent</span>
          </Box>
        }
        variant="outlined"
        sx={{
          height: 38,
          borderColor: "rgba(17,17,17,0.12)",
          bgcolor: "#ffffff",
        }}
      />

      <Stack
        component="nav"
        direction="row"
        flexWrap="wrap"
        gap={1}
        aria-label="站点导航"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = current === item.key;

          return (
            <Button
              key={item.key}
              component={Link}
              href={item.href}
              variant={active ? "contained" : "outlined"}
              startIcon={<Icon sx={{ fontSize: 18 }} />}
              color="primary"
              sx={{
                minWidth: 0,
                color: active ? "#ffffff" : "#3f3f46",
                borderColor: active ? "#111111" : "rgba(17,17,17,0.12)",
                bgcolor: active ? "#111111" : "#ffffff",
                "&:hover": {
                  borderColor: "#111111",
                  bgcolor: active ? "#1f1f1f" : "#fafafa",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}
