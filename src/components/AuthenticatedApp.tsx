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
  Chip,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import Link from "next/link";
import { MAX_CALL_PER_USER } from "../../config";
import {
  Psychology as PsychologyIcon,
  QuestionAnswer as QuestionAnswerIcon,
  FolderSpecial as FolderSpecialIcon,
  Assessment as AssessmentIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAuth } from "react-oidc-context";
import { useState } from "react";
import WebVPNStatus from "./WebVPNStatus";
import { useUserInfo } from "@/store/userInfoContext";

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
  const auth = useAuth();
  const { userInfo, loading: userInfoLoading } = useUserInfo();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [hoverStates, setHoverStates] = useState({
    mbti: false,
    summary: false,
    favorites: false,
    report: false,
  });

  const setHoverState = (card: string, isHover: boolean) => {
    // 移动端禁用hover效果
    if (!isMobile) {
      setHoverStates((prev) => ({ ...prev, [card]: isHover }));
    }
  };

  const handleCardClick = (route: string) => {
    if (route === "developing") {
      setShowModal(true);
    } else {
      window.location.href = route;
    }
  };

  const featureCards = [
    {
      id: "mbti",
      title: "MBTI总结",
      description:
        "基于您的发帖记录分析您的MBTI人格类型，提供个性化的人格分析报告。",
      icon: PsychologyIcon,
      color: "#667eea",
      route: "/mbti",
    },
    {
      id: "summary",
      title: "帖子上下文问答",
      description:
        "对论坛帖子内容进行智能分析，提供上下文相关的问答和内容总结。",
      icon: QuestionAnswerIcon,
      color: "#764ba2",
      route: "/summary",
    },
    {
      id: "favorites",
      title: "智能收藏夹整理",
      description: "使用AI技术自动分类和整理您的收藏内容，让重要信息更易查找。",
      icon: FolderSpecialIcon,
      color: "#f093fb",
      route: "developing",
    },
    {
      id: "report",
      title: "年度报告",
      description:
        "生成您的CC98年度使用报告，包含活跃度分析、兴趣偏好等数据洞察。",
      icon: AssessmentIcon,
      color: "#f5576c",
      route: "developing",
    },
  ];

  return (
    <>
      {/* 移动端优化的AppBar */}
      <AppBar
        position="static"
        sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <Toolbar
          sx={{
            minHeight: { xs: 56, sm: 64 },
            px: { xs: 2, sm: 3 },
          }}
        >
          <Typography
            variant={isMobile ? "h6" : "h5"}
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: "bold",
              fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" },
            }}
          >
            CC98 Hub
          </Typography>
          
          {/* 用户信息显示 */}
          {userInfo && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: { xs: 2, sm: 3 },
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.5 },
              }}
            >
              <PersonIcon
                sx={{
                  color: "white",
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  mr: 1,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  fontWeight: "medium",
                }}
              >
                {userInfo.name}
              </Typography>
            </Box>
          )}
          
          {/* 加载状态显示 */}
          {userInfoLoading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mr: { xs: 2, sm: 3 },
                bgcolor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                px: { xs: 1.5, sm: 2 },
                py: { xs: 0.5, sm: 0.5 },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "white",
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                }}
              >
                加载中...
              </Typography>
            </Box>
          )}

          <Chip
            label={`剩余次数: ${Math.max(0, MAX_CALL_PER_USER - currCount)}`}
            color="secondary"
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              color: "white",
              borderColor: "white",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              "& .MuiChip-label": {
                px: { xs: 1, sm: 1.5 },
              },
            }}
          />
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: 2, sm: 3, md: 4 },
          mb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* WebVPN状态检查 */}
        <WebVPNStatus />

        {/* 功能介绍 - 移动端优化 */}
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, sm: 4 },
            textAlign: "center",
          }}
        >
          <Typography
            variant={isMobile ? "h5" : "h4"}
            fontWeight={300}
            mb={2}
            sx={{ fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" } }}
          >
            {userInfo ? `欢迎回来，${userInfo.name}！` : "欢迎使用CC98 Hub"}
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              lineHeight: { xs: 1.4, sm: 1.5 },
            }}
          >
            {userInfo 
              ? `您的智能CC98助手已准备就绪，为您提供个性化的AI驱动功能体验` 
              : "您的智能CC98助手，提供多种AI驱动的功能来增强您的论坛体验"
            }
          </Typography>
        </Paper>

        {/* 功能卡片网格 - 移动端响应式 */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 3 }}>
          {featureCards.map((card) => (
            <Grid item xs={12} sm={6} md={6} key={card.id}>
              <Card
                elevation={4}
                sx={{
                  minHeight: { xs: "160px", sm: "170px", md: "180px" },
                  border: "1px solid #e0e0e0",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  transform:
                    !isMobile &&
                    hoverStates[card.id as keyof typeof hoverStates]
                      ? "translateY(-6px)"
                      : "translateY(0)",
                  boxShadow:
                    !isMobile &&
                    hoverStates[card.id as keyof typeof hoverStates]
                      ? "0 12px 30px rgba(0,0,0,0.15)"
                      : "0 4px 12px rgba(0,0,0,0.1)",
                  "&:hover": {
                    borderColor: card.color,
                    // 移动端也保留轻微的hover效果
                    ...(isMobile && {
                      boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
                    }),
                  },
                  "&:active": {
                    // 移动端点击效果
                    transform: "scale(0.98)",
                    transition: "transform 0.1s ease",
                  },
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={() => setHoverState(card.id, true)}
                onMouseLeave={() => setHoverState(card.id, false)}
                onClick={() => handleCardClick(card.route)}
              >
                <CardContent
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    p: { xs: 2, sm: 2.5, md: 3 },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${card.color}20`,
                        color: card.color,
                        mr: { xs: 1.5, sm: 2 },
                        width: { xs: 40, sm: 44, md: 48 },
                        height: { xs: 40, sm: 44, md: 48 },
                      }}
                    >
                      <card.icon fontSize={isMobile ? "small" : "medium"} />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant={isSmallMobile ? "subtitle1" : "h6"}
                        component="h2"
                        sx={{
                          fontWeight: "bold",
                          mb: 0.5,
                          fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                          lineHeight: 1.2,
                        }}
                      >
                        {card.title}
                      </Typography>
                    </Box>
                    <ArrowForwardIcon
                      sx={{
                        color: card.color,
                        transition: "transform 0.3s ease",
                        transform:
                          !isMobile &&
                          hoverStates[card.id as keyof typeof hoverStates]
                            ? "translateX(4px)"
                            : "translateX(0)",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      flexGrow: 1,
                      lineHeight: { xs: 1.4, sm: 1.5, md: 1.6 },
                      fontSize: { xs: "0.8rem", sm: "0.85rem", md: "0.9rem" },
                      display: "-webkit-box",
                      WebkitLineClamp: { xs: 3, sm: 4 },
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {card.description}
                  </Typography>

                  {/* 状态指示器 - 移动端优化 */}
                  <Box
                    sx={{
                      mt: { xs: 1.5, sm: 2 },
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {card.route === "developing" ? (
                      <Chip
                        label="即将推出"
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: card.color,
                          color: card.color,
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          height: { xs: 24, sm: 28 },
                        }}
                      />
                    ) : (
                      <Chip
                        label="立即体验"
                        size="small"
                        sx={{
                          bgcolor: card.color,
                          color: "white",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                          height: { xs: 24, sm: 28 },
                        }}
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* 开发中模态框 - 移动端优化 */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "450px" },
            maxWidth: { xs: "350px", sm: "400px", md: "450px" },
            bgcolor: "background.paper",
            borderRadius: { xs: 2, sm: 3 },
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.12)",
            p: { xs: 3, sm: 4 },
            outline: "none",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              id="modal-modal-title"
              variant={isMobile ? "h6" : "h5"}
              component="h2"
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                lineHeight: 1.2,
                pr: 2,
              }}
            >
              🚧 功能开发中
            </Typography>
            <IconButton
              onClick={() => setShowModal(false)}
              sx={{
                color: "grey.500",
                p: { xs: 0.5, sm: 1 },
              }}
            >
              <CloseIcon fontSize={isMobile ? "small" : "medium"} />
            </IconButton>
          </Box>

          <Typography
            id="modal-modal-description"
            variant="body1"
            sx={{
              mb: { xs: 2, sm: 3 },
              lineHeight: 1.6,
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            该功能正在紧张开发中，敬请期待！我们会尽快为您带来更多实用的AI功能。
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
          >
            <Button
              variant="contained"
              onClick={() => setShowModal(false)}
              fullWidth={isMobile}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                py: { xs: 1, sm: 1.5 },
              }}
            >
              我知道了
            </Button>
            <Button
              variant="outlined"
              component={Link}
              href="/mbti"
              fullWidth={isMobile}
              sx={{
                fontSize: { xs: "0.875rem", sm: "1rem" },
                py: { xs: 1, sm: 1.5 },
              }}
            >
              体验其他功能
            </Button>
          </Stack>
        </Box>
      </Modal>
    </>
  );
};

export default AuthenticatedApp;
