'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DescriptionRounded } from '@mui/icons-material';
import Link from 'next/link';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { CsrPageFallback } from '@/components/CsrPageFallback';
import { SiteNav } from '@/components/SiteNav';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[420px] items-center justify-center text-sm text-slate-500">
      正在加载 Swagger UI...
    </div>
  ),
});

function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/swagger')
      .then((response) => response.json())
      .then((data) => setSpec(data))
      .catch((error) => console.error('Error loading API spec:', error));
  }, []);

  return (
    <div className="page-root">
      <main className="page-container">
        <SiteNav current="api-docs" />

        <Box
          component="section"
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0,1.15fr) 340px' },
          }}
        >
          <Paper className="mui-dark-panel" sx={{ p: { xs: 3, md: 4 } }}>
            <Stack spacing={3}>
              <Chip
                icon={<DescriptionRounded />}
                label="接口文档"
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  color: '#e4e4e7',
                  borderColor: 'rgba(255,255,255,0.14)',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  '& .MuiChip-icon': { color: '#ffffff' },
                }}
              />
              <Box>
                <Typography
                  variant="h2"
                  fontWeight={700}
                  letterSpacing="-0.04em"
                  sx={{ fontSize: { xs: '2.2rem', md: '3rem' } }}
                >
                  用统一的页面查看接口说明。
                </Typography>
                <Typography mt={2} maxWidth={620} color="rgba(255,255,255,0.72)">
                  适合联调、查字段和看 Swagger。
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper className="mui-light-panel" sx={{ p: { xs: 3, md: 3.5 } }}>
            <Stack spacing={3}>
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ letterSpacing: '0.24em', fontWeight: 700 }}
              >
                文档入口
              </Typography>
              <Stack spacing={1.5}>
                <Paper variant="outlined" sx={{ px: 2.5, py: 2.5, bgcolor: 'rgba(17,17,17,0.02)' }}>
                  <Typography variant="h6" fontWeight={700}>适合做什么</Typography>
                  <Typography mt={1} variant="body2" color="text.secondary">
                    看 Swagger、查字段、做联调。
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ px: 2.5, py: 2.5, bgcolor: 'rgba(17,17,17,0.02)' }}>
                  <Typography variant="h6" fontWeight={700}>常用联动</Typography>
                  <Typography mt={1} variant="body2" color="text.secondary">
                    问答页和 MBTI 页都可以回到这里核对接口。
                  </Typography>
                </Paper>
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={1.5}>
                <Button component={Link} href="/summary" variant="outlined">
                  打开帖子问答
                </Button>
                <Button component={Link} href="/chat" variant="outlined">
                  打开聊天页
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Box>

        {!mounted || !spec ? (
          <Paper className="mui-light-panel" sx={{ mt: 3, px: 8, py: 10, textAlign: 'center' }}>
            <Stack spacing={2.5} alignItems="center">
              <Chip label="Loading" variant="outlined" />
              <Typography variant="h4" fontWeight={700}>
                {mounted ? '正在加载 API 文档' : '正在初始化文档页面'}
              </Typography>
              <Typography maxWidth={620} color="text.secondary">
                Swagger UI 会在客户端挂载后加载。
              </Typography>
            </Stack>
          </Paper>
        ) : (
          <Paper className="mui-light-panel" sx={{ mt: 3, overflow: 'hidden' }}>
            <Box sx={{ borderBottom: '1px solid rgba(17,17,17,0.08)', bgcolor: 'rgba(17,17,17,0.03)', px: { xs: 3, md: 4 }, py: 2.5 }}>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                CC98 Agent API 文档
              </h2>
              <p className="mt-2 text-sm text-slate-600">当前展示运行中的 Swagger 规范。</p>
            </Box>
            <div className="bg-white/80 px-3 py-3 md:px-6 md:py-6">
              <SwaggerUI spec={spec} />
            </div>
          </Paper>
        )}
      </main>
    </div>
  );
}

export default dynamic(() => Promise.resolve(ApiDocsPage), {
  ssr: false,
  loading: () => (
    <CsrPageFallback current="api-docs" title="正在加载接口文档页" />
  ),
});

