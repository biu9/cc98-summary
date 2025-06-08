"use client"
import { Chip, Box } from "@mui/material";
import { IReferenceProps } from "../types";

interface SelectedTopicsProps {
  selectedTopics: IReferenceProps[];
  onRemoveTopic: (topicId: number) => void;
}

const SelectedTopics: React.FC<SelectedTopicsProps> = ({ selectedTopics, onRemoveTopic }) => {
  if (selectedTopics.length === 0) {
    return null;
  }

  return (
    <Box className="mb-3">
      <div className="text-xs text-gray-600 mb-2">
        已选择参考帖子 ({selectedTopics.length}):
      </div>
      <div className="flex flex-wrap gap-2">
        {selectedTopics.map((topic) => (
          <Chip
            key={topic.id}
            label={`${topic.label} (${topic.replyCount}回复)`}
            onDelete={() => onRemoveTopic(topic.id)}
            size="small"
            sx={{
              backgroundColor: '#e3f2fd',
              color: '#1565c0',
              '& .MuiChip-deleteIcon': {
                color: '#1565c0',
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