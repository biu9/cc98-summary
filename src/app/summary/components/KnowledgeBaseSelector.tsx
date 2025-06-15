import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip
} from '@mui/material';
import { useSummaryStore } from '@/store/summaryStore';

export const KnowledgeBaseSelector: React.FC = () => {
  const { 
    knowledgeBases, 
    selectedKnowledgeBase, 
    setSelectedKnowledgeBase, 
    setSelectedTopics 
  } = useSummaryStore();

  const handleKnowledgeBaseChange = (kbId: string) => {
    if (kbId === '') {
      setSelectedKnowledgeBase(null);
      setSelectedTopics([]);
    } else {
      const kb = knowledgeBases.find(kb => kb.id === kbId);
      if (kb) {
        setSelectedKnowledgeBase(kb);
        setSelectedTopics(kb.topics);
      }
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel>选择收藏帖子知识库</InputLabel>
        <Select
          value={selectedKnowledgeBase?.id || ''}
          label="选择收藏帖子知识库"
          onChange={(e) => handleKnowledgeBaseChange(e.target.value)}
        >
          <MenuItem value="">
            <em>请选择一个知识库</em>
          </MenuItem>
          {knowledgeBases.map((kb) => (
            <MenuItem key={kb.id} value={kb.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>{kb.name}</Typography>
                <Chip 
                  label={`${kb.topics.length} 帖子`} 
                  size="small" 
                  variant="outlined" 
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      {selectedKnowledgeBase && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          已选择知识库：{selectedKnowledgeBase.name}
          {selectedKnowledgeBase.description && ` - ${selectedKnowledgeBase.description}`}
        </Typography>
      )}

      {knowledgeBases.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          正在加载收藏帖子知识库...
        </Typography>
      )}
    </Box>
  );
}; 