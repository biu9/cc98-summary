"use client"
import { Chip, Box, Typography, Button, Collapse } from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { useState } from "react";
import { IReferenceProps, IKnowledgeBase } from "../types";

interface SelectedTopicsProps {
  selectedTopics: IReferenceProps[];
  onRemoveTopic: (topicId: number) => void;
  selectedKnowledgeBase?: IKnowledgeBase | null;
}

const SelectedTopics: React.FC<SelectedTopicsProps> = ({ selectedTopics, onRemoveTopic, selectedKnowledgeBase }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (selectedTopics.length === 0) {
    return null;
  }

  const isFromKnowledgeBase = selectedKnowledgeBase !== null;
  
  // 当帖子数量超过10个时，默认只显示前10个
  const DISPLAY_LIMIT = 10;
  const hasMore = selectedTopics.length > DISPLAY_LIMIT;
  const displayTopics = expanded ? selectedTopics : selectedTopics.slice(0, DISPLAY_LIMIT);

  // 截取标题，避免过长
  const truncateTitle = (title: string, maxLength: number = 25) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <Box className="mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-600">
          {isFromKnowledgeBase 
            ? `收藏知识库"${selectedKnowledgeBase?.name}"中的帖子 (${selectedTopics.length}):`
            : `当前选择的帖子 (${selectedTopics.length}):`
          }
        </div>
        {hasMore && (
          <Button
            size="small"
            variant="text"
            onClick={() => setExpanded(!expanded)}
            startIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            sx={{ 
              fontSize: '0.75rem',
              minWidth: 'auto',
              padding: '2px 8px',
              color: 'text.secondary'
            }}
          >
            {expanded ? '收起' : `展开全部 (${selectedTopics.length})`}
          </Button>
        )}
      </div>
      
      {isFromKnowledgeBase && selectedKnowledgeBase?.description && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {selectedKnowledgeBase.description}
        </Typography>
      )}
      
      <Box sx={{ 
        maxHeight: expanded ? 'none' : '120px',
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out'
      }}>
        <div className="flex flex-wrap gap-1">
          {displayTopics.map((topic) => (
            <Chip
              key={topic.id}
              label={`${truncateTitle(topic.label)} (${topic.replyCount})`}
              onDelete={() => onRemoveTopic(topic.id)}
              size="small"
              sx={{
                backgroundColor: isFromKnowledgeBase ? '#fff3e0' : '#e3f2fd',
                color: isFromKnowledgeBase ? '#f57c00' : '#1565c0',
                fontSize: '0.7rem',
                height: '24px',
                maxWidth: '200px',
                '& .MuiChip-label': {
                  paddingX: '6px',
                  fontSize: '0.7rem'
                },
                '& .MuiChip-deleteIcon': {
                  fontSize: '14px',
                  color: isFromKnowledgeBase ? '#f57c00' : '#1565c0',
                  '&:hover': {
                    color: '#d32f2f'
                  }
                }
              }}
            />
          ))}
        </div>
      </Box>
      
      {hasMore && !expanded && (
        <Box sx={{ mt: 1, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            还有 {selectedTopics.length - DISPLAY_LIMIT} 个帖子...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default SelectedTopics; 