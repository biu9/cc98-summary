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
        <InputLabel>选择知识库（可选）</InputLabel>
        <Select
          value={selectedKnowledgeBase?.id || ''}
          label="选择知识库（可选）"
          onChange={(e) => handleKnowledgeBaseChange(e.target.value)}
        >
          <MenuItem value="">
            <em>不使用知识库 - 手动选择帖子</em>
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
    </Box>
  );
}; 