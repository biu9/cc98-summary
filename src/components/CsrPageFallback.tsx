import { SiteNav } from "@/components/SiteNav";
import { Chip, Paper, Stack, Typography } from "@mui/material";

interface CsrPageFallbackProps {
  current:
    | "home"
    | "auth"
    | "favorites"
    | "mbti"
    | "summary"
    | "chat"
    | "api-docs";
  title: string;
  description?: string;
}

export function CsrPageFallback({
  current,
  title,
  description = "页面将在客户端完成渲染。",
}: CsrPageFallbackProps) {
  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current={current} />
        <Paper
          className="mui-light-panel"
          sx={{
            mx: "auto",
            maxWidth: 880,
            px: { xs: 3, md: 6 },
            py: { xs: 8, md: 10 },
            textAlign: "center",
          }}
        >
          <Stack spacing={2.5} alignItems="center">
            <Chip label="CSR" variant="outlined" />
            <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em">
              {title}
            </Typography>
            <Typography maxWidth={620} color="text.secondary" lineHeight={1.8}>
              {description}
            </Typography>
          </Stack>
        </Paper>
      </main>
    </div>
  );
}
