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
} from "@mui/material";
import Link from "next/link";
import { MAX_CALL_PER_USER } from "../../config";
import { Psychology as PsychologyIcon, Description as DescriptionIcon, Close as CloseIcon, ArrowForward as ArrowForwardIcon } from "@mui/icons-material";
import { useAuth } from "react-oidc-context";
import { useState } from "react";
import WebVPNStatus from "./WebVPNStatus";

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
  const [isHoveringAI, setIsHoveringAI] = useState(false);
  const [isHoveringGenerate, setIsHoveringGenerate] = useState(false);

  return (
    <Box sx={{ minHeight: "100vh", py: 4, px: { xs: 2, md: 4 } }}>
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            CC98 Hub
          </Typography>
          <Chip 
            label={`剩余次数: ${Math.max(0, 100 - currCount)}`}
            color="secondary"
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <WebVPNStatus />
        
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={4}
              sx={{ 
                minHeight: "150px",
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHoveringAI ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHoveringAI ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: '#667eea'
                }
              }}
              onMouseEnter={() => setIsHoveringAI(true)}
              onMouseLeave={() => setIsHoveringAI(false)}
              onClick={() => setShowModal(true)}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#667eea', mr: 2 }}>
                    <PsychologyIcon />
                  </Avatar>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    AI助手
                  </Typography>
                  <ArrowForwardIcon 
                    sx={{ 
                      ml: 'auto', 
                      transition: 'transform 0.3s ease',
                      transform: isHoveringAI ? 'translateX(4px)' : 'translateX(0)'
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  智能分析您的CC98活动数据，提供个性化的内容推荐和使用习惯分析。
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card 
              elevation={4}
              sx={{ 
                minHeight: "150px",
                border: '1px solid #e0e0e0',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                transform: isHoveringGenerate ? 'translateY(-4px)' : 'translateY(0)',
                boxShadow: isHoveringGenerate ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 10px rgba(0,0,0,0.1)',
                '&:hover': {
                  borderColor: '#764ba2'
                }
              }}
              onMouseEnter={() => setIsHoveringGenerate(true)}
              onMouseLeave={() => setIsHoveringGenerate(false)}
            >
              <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: '#764ba2', mr: 2 }}>
                    <DescriptionIcon />
                  </Avatar>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
                    生成报告
                  </Typography>
                  <ArrowForwardIcon 
                    sx={{ 
                      ml: 'auto', 
                      transition: 'transform 0.3s ease',
                      transform: isHoveringGenerate ? 'translateX(4px)' : 'translateX(0)'
                    }} 
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1 }}>
                  基于您的CC98使用数据，生成详细的个人活动报告和数据可视化图表。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 400,
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              功能开发中
            </Typography>
            <IconButton onClick={() => setShowModal(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            AI助手功能正在开发中，敬请期待！
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
};

export default AuthenticatedApp;
