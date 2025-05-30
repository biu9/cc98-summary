"use client";
import { Button, Alert, Modal, Card, CardContent, Typography, TextField, InputAdornment, Divider, Box, Grid, Stack, Paper, List, ListItem, ListItemText, ListItemIcon } from "@mui/material"
import { useEffect, useState } from "react"
import { AuthProvider, useAuth } from "react-oidc-context";
import { OIDC_CONFIG, MAX_CALL_PER_USER } from "../../config";
import { FeedbackContext } from "@/store/feedBackContext";
import { getCurrentCount } from "@/utils/limitation";
import Link from "next/link";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const UnauthenticatedApp = () => {
  const auth = useAuth()
  const today = new Date()
  const day = today.getDate()
  const suffix = getSuffix(day)
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const month = monthNames[today.getMonth()]
  
  function getSuffix(day: number) {
    if (day > 3 && day < 21) return 'th'
    switch (day % 10) {
      case 1: return "st"
      case 2: return "nd"
      case 3: return "rd"
      default: return "th"
    }
  }

  return (
    <Box className="min-h-screen p-8 flex items-center justify-center">
      <Grid container spacing={3} className="max-w-5xl w-full">
        {/* 登录卡片 */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={3} 
            className="overflow-hidden"
            sx={{ 
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-5px)'
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={2} mb={3}>
                <Typography variant="h5" fontWeight="500">CC98 Hub</Typography>
                <Typography variant="subtitle1" color="text.secondary" fontWeight="300">登录</Typography>
              </Stack>
              
              <Box mb={4} onClick={() => auth.signinRedirect()}>
                <Button 
                  fullWidth
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    borderRadius: '50px', 
                    py: 1.5,
                    bgcolor: '#e3f2fd',
                    color: '#1976d2',
                    '&:hover': { 
                      bgcolor: '#bbdefb',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(25, 118, 210, 0.15)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  startIcon={<ArrowDropDownIcon />}
                >
                  CC98授权登录
                </Button>
                
                <Stack spacing={2} mt={3}>
                  <TextField
                    fullWidth
                    placeholder="电子邮箱(暂未开放)"
                    variant="outlined"
                    disabled
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '50px'
                      }
                    }}
                  />
                  
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="密码(暂未开放)"
                    variant="outlined"
                    disabled
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '50px'
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="body2" color="text.secondary">
                            忘记密码?
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Box>
              
              <Button 
                fullWidth
                variant="contained"
                sx={{ 
                  borderRadius: '50px', 
                  py: 1.5, 
                  bgcolor: 'var(--accent-color)', 
                  '&:hover': { 
                    bgcolor: '#474747',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}
                onClick={() => auth.signinRedirect()}
              >
                登录
              </Button>
              
              <Typography variant="caption" color="text.secondary" mt={3} display="block">
                登录即表示您同意我们的使用条款和隐私政策。
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* 活动卡片 */}
        <Grid item xs={12} md={6}>
          <Card 
            elevation={3} 
            className="h-full" 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'all 0.3s ease',
              '&:hover': { 
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                transform: 'translateY(-5px)'
              }
            }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="text.secondary">功能预览</Typography>
              <Typography variant="body2" color="text.secondary">CC98 Hub</Typography>
            </Box>
            
            <Divider />
            
            <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="h3" fontWeight="200" sx={{ fontSize: '4rem', lineHeight: 1 }}>
                  {month}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                  <Typography variant="h3" fontWeight="200" sx={{ fontSize: '4rem', lineHeight: 1 }}>
                    {day}
                  </Typography>
                  <Typography variant="h4" fontWeight="200" color="text.secondary" sx={{ fontSize: '2.5rem' }}>
                    {suffix}
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" mt={2}>
                  登录后即可体验以下功能
                </Typography>
              </Box>
              
              <Stack spacing={2} mt={4}>
                <List disablePadding>
                  <ListItem 
                    sx={{ 
                      py: 1.5, 
                      px: 0,
                      borderRadius: '8px',
                      '&:hover': { 
                        bgcolor: 'rgba(0, 0, 0, 0.03)',
                        '& .MuiSvgIcon-root': {
                          transform: 'translateX(4px)',
                          color: '#1976d2'
                        }
                      }
                    }}
                  >
                    <ListItemText primary="MBTI测试" />
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <ChevronRightIcon sx={{ transition: 'all 0.2s ease' }} />
                    </ListItemIcon>
                  </ListItem>
                  <ListItem 
                    sx={{ 
                      py: 1.5, 
                      px: 0,
                      borderRadius: '8px',
                      '&:hover': { 
                        bgcolor: 'rgba(0, 0, 0, 0.03)',
                        '& .MuiSvgIcon-root': {
                          transform: 'translateX(4px)',
                          color: '#1976d2'
                        }
                      }
                    }}
                  >
                    <ListItemText primary="文档总结" />
                    <ListItemIcon sx={{ minWidth: 'auto' }}>
                      <ChevronRightIcon sx={{ transition: 'all 0.2s ease' }} />
                    </ListItemIcon>
                  </ListItem>
                </List>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default function Home() {
  const [feedback, setFeedback] = useState<string>('');
  const [showModal, setShowModal] = useState(true);
  const [currCount, setCurrCount] = useState(0);

  const setFeedbackFunc = (feedback: string) => {
    setFeedback(feedback);
  }

  const clearFeedback = () => {
    setFeedback('');
  }

  useEffect(() => {
    const count = getCurrentCount();
    setCurrCount(count);
  },[])

  return (
    <AuthProvider {...OIDC_CONFIG}>
      <FeedbackContext.Provider value={{ feedback: '', setFeedback: setFeedbackFunc }}>
      {
        feedback && <Alert severity="error" onClose={clearFeedback} className="m-4">{feedback}</Alert>
      }
      <App showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
      </FeedbackContext.Provider>
    </AuthProvider>
  )
}

const App = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  const auth = useAuth()

  if(auth.isAuthenticated) {
    return <AuthenticatedApp showModal={showModal} setShowModal={setShowModal} currCount={currCount} />
  }
  return <UnauthenticatedApp />
}

const AuthenticatedApp = ({ showModal, setShowModal, currCount }: { 
  showModal: boolean, 
  setShowModal: (show: boolean) => void,
  currCount: number
}) => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="elegant-card mb-6">
        <div className="elegant-header">
          <h1 className="text-2xl font-medium">CC98 Hub</h1>
          <div className="flex space-x-4">
            <Link href="/mbti" className="elegant-button">MBTI测试</Link>
            <Link href="/summary" className="elegant-button">文档总结</Link>
          </div>
        </div>
        
        <div className="p-8 text-center">
          <h2 className="text-2xl font-light mb-4">欢迎使用CC98 Hub</h2>
          <p className="text-gray-500 mb-6">请选择上方功能开始使用</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link href="/mbti" className="elegant-card p-6 hover:shadow-lg transform hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl mb-2">MBTI测试</h3>
              <p className="text-gray-500 text-sm">基于您的发帖记录分析您的MBTI人格类型</p>
            </Link>
            
            <Link href="/summary" className="elegant-card p-6 hover:shadow-lg transform hover:-translate-y-1 transition duration-300">
              <h3 className="text-xl mb-2">文档总结</h3>
              <p className="text-gray-500 text-sm">对论坛帖子内容进行智能总结和问答</p>
            </Link>
          </div>
        </div>
      </div>
      
      <Modal
        open={showModal}
        onClose={(e) => setShowModal(false)}
      >
        <div className="elegant-card w-11/12 md:w-[450px] absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
          <h2 className="text-2xl font-bold mb-4">使用前须知</h2>
          <p className="mb-4">由于目前使用的是白嫖的Gemini 1.5模型，每分钟最多发起15次请求，一天最多发起1500次请求，所以目前做了单用户单日限次处理。</p>
          <p className="font-medium">当前限制：<span className="text-blue-600">每个用户每日最多调用次数: {MAX_CALL_PER_USER}</span></p>
          <p className="font-medium mt-2">您今日已调用次数: <span className="text-blue-600">{currCount}</span></p>
          <button 
            className="elegant-button w-full mt-6"
            onClick={() => setShowModal(false)}
          >
            我已了解
          </button>
        </div>
      </Modal>
    </div>
  )
}