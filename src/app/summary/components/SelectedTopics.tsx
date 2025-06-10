"use client"
import { Chip, Box, Typography } from "@mui/material";
import { IReferenceProps, IKnowledgeBase } from "../types";

interface SelectedTopicsProps {
  selectedTopics: IReferenceProps[];
  onRemoveTopic: (topicId: number) => void;
  selectedKnowledgeBase?: IKnowledgeBase | null;
}

const SelectedTopics: React.FC<SelectedTopicsProps> = ({ selectedTopics, onRemoveTopic, selectedKnowledgeBase }) => {
  if (selectedTopics.length === 0) {
    return null;
  }

  const isFromKnowledgeBase = selectedKnowledgeBase !== null;

  return (
    <Box className="mb-3">
      <div className="text-xs text-gray-600 mb-2">
        {isFromKnowledgeBase 
          ? `来自知识库"${selectedKnowledgeBase?.name}"的帖子 (${selectedTopics.length}):`
          : `已选择参考帖子 (${selectedTopics.length}):`
        }
      </div>
      {isFromKnowledgeBase && selectedKnowledgeBase?.description && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {selectedKnowledgeBase.description}
        </Typography>
      )}
      <div className="flex flex-wrap gap-2">
        {selectedTopics.map((topic) => (
          <Chip
            key={topic.id}
            label={`${topic.label} (${topic.replyCount}回复)`}
            onDelete={() => onRemoveTopic(topic.id)}
            size="small"
            sx={{
              backgroundColor: isFromKnowledgeBase ? '#fff3e0' : '#e3f2fd',
              color: isFromKnowledgeBase ? '#f57c00' : '#1565c0',
              '& .MuiChip-deleteIcon': {
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
  );
};

export default SelectedTopics; 