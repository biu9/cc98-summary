import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Folder as FolderIcon,
  CheckCircle as CheckCircleIcon,
  Article as ArticleIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useSummaryStore } from '@/store/summaryStore';
import { IKnowledgeBase } from '../types';
import { useAuth } from 'react-oidc-context';

export const KnowledgeBaseList: React.FC = () => {
  const auth = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    knowledgeBases, 
    selectedKnowledgeBase, 
    selectKnowledgeBase,
    loadKnowledgeBases,
    setFeedback
  } = useSummaryStore();

  const handleSelectKnowledgeBase = (kb: IKnowledgeBase) => {
    selectKnowledgeBase(kb);
  };

  const handleRefreshKnowledgeBases = async () => {
    if (!auth.user?.access_token) {
      setFeedback('未找到访问令牌，请重新登录');
      return;
    }

    setIsRefreshing(true);
    try {
      await loadKnowledgeBases(auth.user.access_token);
      setFeedback('知识库已重新加载');
    } catch (error) {
      console.error('重新加载知识库失败:', error);
      setFeedback('重新加载知识库失败，请稍后重试');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (knowledgeBases.length === 0) {
    return (
      <Box className="p-4 h-full flex items-center justify-center">
        <Card sx={{ p: 3, textAlign: 'center', bgcolor: '#f8f9fa', border: 'none', boxShadow: 'none' }}>
          <ArticleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            暂无知识库
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            正在加载您的收藏帖子知识库...
          </Typography>
          <Button
            variant="outlined"
            startIcon={isRefreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefreshKnowledgeBases}
            disabled={isRefreshing}
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.04)'
              }
            }}
          >
            {isRefreshing ? '刷新中...' : '重新获取'}
          </Button>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="h-full">
      {/* 标题栏 */}
      <Box className="sticky top-0 bg-white border-b border-gray-100 p-4 z-10">
        <Box className="flex items-center justify-between mb-2">
          <Typography variant="h6" className="font-medium text-gray-800">
            📚 收藏知识库
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={isRefreshing ? <CircularProgress size={14} /> : <RefreshIcon />}
            onClick={handleRefreshKnowledgeBases}
            disabled={isRefreshing}
            sx={{
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              borderColor: '#667eea',
              color: '#667eea',
              fontSize: '0.75rem',
              '&:hover': {
                borderColor: '#5a6fd8',
                backgroundColor: 'rgba(102, 126, 234, 0.04)'
              },
              '&:disabled': {
                borderColor: '#e5e7eb',
                color: '#9ca3af'
              }
            }}
          >
            {isRefreshing ? '刷新中' : '刷新'}
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" className="mt-1">
          选择知识库开始对话
        </Typography>
      </Box>
      
      {/* 知识库列表 */}
      <Box className="p-4 space-y-3">
        {knowledgeBases.map((kb) => (
          <Card
            key={kb.id}
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              border: selectedKnowledgeBase?.id === kb.id ? '2px solid #667eea' : '1px solid #e5e7eb',
              bgcolor: selectedKnowledgeBase?.id === kb.id ? '#f0f4ff' : 'white',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                boxShadow: selectedKnowledgeBase?.id === kb.id 
                  ? '0 8px 25px rgba(102, 126, 234, 0.15)' 
                  : '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-1px)',
                borderColor: selectedKnowledgeBase?.id === kb.id ? '#667eea' : '#d1d5db'
              }
            }}
            onClick={() => handleSelectKnowledgeBase(kb)}
          >
            {/* 选中指示器 */}
            {selectedKnowledgeBase?.id === kb.id && (
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '0 2px 2px 0'
                }}
              />
            )}
            
            <CardContent sx={{ p: 3, pl: selectedKnowledgeBase?.id === kb.id ? 3.5 : 3 }}>
              <Box className="flex items-start justify-between mb-2">
                <Box className="flex items-center flex-1">
                  <FolderIcon 
                    sx={{ 
                      color: selectedKnowledgeBase?.id === kb.id ? '#667eea' : '#6b7280',
                      mr: 1.5,
                      fontSize: 22
                    }} 
                  />
                  <Typography 
                    variant="subtitle1" 
                    className="font-medium line-clamp-2"
                    sx={{ 
                      color: selectedKnowledgeBase?.id === kb.id ? '#667eea' : 'text.primary',
                      flex: 1,
                      fontSize: '0.95rem'
                    }}
                  >
                    {kb.name}
                  </Typography>
                </Box>
                
                {selectedKnowledgeBase?.id === kb.id && (
                  <CheckCircleIcon sx={{ color: '#667eea', fontSize: 20, ml: 1 }} />
                )}
              </Box>
              
              {kb.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  className="mb-3 line-clamp-2"
                  sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}
                >
                  {kb.description}
                </Typography>
              )}
              
              <Box className="flex items-center justify-between">
                <Chip
                  size="small"
                  label={`${kb.topics.length} 个帖子`}
                  icon={<ArticleIcon sx={{ fontSize: '0.875rem !important' }} />}
                  sx={{
                    bgcolor: selectedKnowledgeBase?.id === kb.id ? '#667eea' : '#f3f4f6',
                    color: selectedKnowledgeBase?.id === kb.id ? 'white' : '#6b7280',
                    fontSize: '0.75rem',
                    height: '24px',
                    '& .MuiChip-icon': {
                      color: selectedKnowledgeBase?.id === kb.id ? 'white' : '#6b7280'
                    }
                  }}
                />
                
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {new Date(kb.updatedAt).toLocaleDateString('zh-CN')}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
}; 