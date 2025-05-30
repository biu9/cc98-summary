"use client";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Modal,
  Stack,
  AppBar,
  Toolbar,
  Container,
  Divider,
  Paper,
  Avatar,
  IconButton,
} from "@mui/material";
import Link from "next/link";
import { MAX_CALL_PER_USER } from "../../config";
import PsychologyIcon from '@mui/icons-material/Psychology';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface AuthenticatedAppProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  currCount: number;
}

const AuthenticatedApp = ({
  showModal,
  setShowModal,
  currCount,
}: AuthenticatedAppProps) => {
  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, md: 4 } }}>
      <Card elevation={3} sx={{ mb: 4, height: "100%", pb: 10 }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar
            sx={{
              justifyContent: "space-between",
              borderBottom: "1px solid #eee",
              px: { xs: 2, md: 3 },
              py: 1.5,
            }}
          >
            <Typography variant="h5" fontWeight={500}>
              CC98 Hub
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button
                component={Link}
                href="/mbti"
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  bgcolor: "var(--accent-color)",
                  "&:hover": {
                    bgcolor: "#474747",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                MBTI测试
              </Button>
              <Button
                component={Link}
                href="/summary"
                variant="contained"
                sx={{
                  borderRadius: "50px",
                  bgcolor: "var(--accent-color)",
                  "&:hover": {
                    bgcolor: "#474747",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                文档总结
              </Button>
            </Stack>
          </Toolbar>
        </AppBar>

        <CardContent sx={{ py: 5, textAlign: "center" }}>
          <Typography variant="h4" fontWeight={300} mb={2}>
            欢迎使用CC98 Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={5}>
            请选择上方功能开始使用
          </Typography>

          <Container maxWidth="md" disableGutters sx={{ px: { xs: 2, sm: 4, md: 6 } }}>
            <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card
                  component={Link}
                  href="/mbti"
                  elevation={4}
                  sx={{
                    p: 4,
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                    minHeight: "150px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
                      borderColor: "transparent",
                      "& .arrow-icon": {
                        transform: "translateX(4px)",
                        opacity: 1,
                      }
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: "rgba(25, 118, 210, 0.12)", color: "primary.main", width: 45, height: 45 }}>
                      <PsychologyIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={500}>
                      MBTI测试
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    基于您的发帖记录分析您的MBTI人格类型
                  </Typography>
                  <Box 
                    className="arrow-icon"
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      opacity: 0.5,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ArrowForwardIcon color="primary" />
                  </Box>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card
                  component={Link}
                  href="/summary"
                  elevation={4}
                  sx={{
                    p: 4,
                    display: "block",
                    textDecoration: "none",
                    height: "100%",
                    minHeight: "150px",
                    border: "1px solid rgba(0,0,0,0.08)",
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.12)",
                      borderColor: "transparent",
                      "& .arrow-icon": {
                        transform: "translateX(4px)",
                        opacity: 1,
                      }
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                    <Avatar sx={{ bgcolor: "rgba(46, 125, 50, 0.12)", color: "success.main", width: 45, height: 45 }}>
                      <DescriptionIcon fontSize="medium" />
                    </Avatar>
                    <Typography variant="h6" fontWeight={500}>
                      文档总结
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    对论坛帖子内容进行智能总结和问答
                  </Typography>
                  <Box 
                    className="arrow-icon"
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      right: 16,
                      opacity: 0.5,
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ArrowForwardIcon color="success" />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Container>
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="notice-modal-title"
      >
        <Paper
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", md: 450 },
            p: 4,
            borderRadius: 2,
            outline: "none",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
          }}
        >
          <Typography
            id="notice-modal-title"
            variant="h5"
            fontWeight={600}
            mb={2}
          >
            使用前须知
          </Typography>
          <Typography variant="body2" mb={3}>
            由于目前使用的是白嫖的Gemini
            1.5模型，每分钟最多发起15次请求，一天最多发起1500次请求，所以目前做了单用户单日限次处理。
          </Typography>

          <Stack spacing={1.5} mb={3}>
            <Typography variant="body1" fontWeight={500}>
              当前限制：
              <Typography
                component="span"
                color="primary"
                fontWeight={600}
                sx={{ ml: 1 }}
              >
                每个用户每日最多调用次数: {MAX_CALL_PER_USER}
              </Typography>
            </Typography>

            <Typography variant="body1" fontWeight={500}>
              您今日已调用次数：
              <Typography
                component="span"
                color="primary"
                fontWeight={600}
                sx={{ ml: 1 }}
              >
                {currCount}
              </Typography>
            </Typography>
          </Stack>

          <Button
            fullWidth
            variant="contained"
            sx={{
              mt: 2,
              borderRadius: "50px",
              py: 1,
              bgcolor: "var(--accent-color)",
              "&:hover": {
                bgcolor: "#474747",
                transform: "translateY(-2px)",
                boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
              },
              transition: "all 0.3s ease",
            }}
            onClick={() => setShowModal(false)}
          >
            我已了解
          </Button>
        </Paper>
      </Modal>
    </Box>
  );
};

export default AuthenticatedApp;
