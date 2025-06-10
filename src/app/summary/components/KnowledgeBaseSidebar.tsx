import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Box,
  Divider,
  Alert,
  Card,
  CardHeader,
  CardContent,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Folder as FolderIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { IReferenceProps, IKnowledgeBase } from '../types';
import Reference from './Reference';
import { useSummaryStore } from '@/store/summaryStore';

interface KnowledgeBaseSidebarProps {
  accessToken?: string;
}

export const KnowledgeBaseSidebar: React.FC<KnowledgeBaseSidebarProps> = ({
  accessToken
}) => {
  const {
    knowledgeBases,
    selectedKnowledgeBase,
    selectedTopics,
    createKnowledgeBase,
    updateKnowledgeBase,
    deleteKnowledgeBase,
    selectKnowledgeBase
  } = useSummaryStore();
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingKB, setEditingKB] = useState<IKnowledgeBase | null>(null);
  const [kbName, setKbName] = useState('');
  const [kbDescription, setKbDescription] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [kbToDelete, setKbToDelete] = useState<IKnowledgeBase | null>(null);
  const [dialogTopics, setDialogTopics] = useState<IReferenceProps[]>([]);

  const handleCreateKB = async () => {
    if (!kbName.trim()) {
      return;
    }

    if (dialogTopics.length === 0) {
      return;
    }

    const success = await createKnowledgeBase(kbName, kbDescription, dialogTopics);

    if (success) {
      setCreateDialogOpen(false);
      setKbName('');
      setKbDescription('');
      setDialogTopics([]);
    }
  };

  const handleEditKB = (kb: IKnowledgeBase) => {
    setEditingKB(kb);
    setKbName(kb.name);
    setKbDescription(kb.description);
    setDialogTopics([...kb.topics]);
    setCreateDialogOpen(true);
  };

  const handleUpdateKB = async () => {
    if (!editingKB || !kbName.trim()) {
      return;
    }

    const updatedKB = {
      ...editingKB,
      name: kbName,
      description: kbDescription,
      topics: dialogTopics,
      updatedAt: new Date()
    };

    const success = await updateKnowledgeBase(updatedKB);

    if (success) {
      setCreateDialogOpen(false);
      setEditingKB(null);
      setKbName('');
      setKbDescription('');
      setDialogTopics([]);
    }
  };

  const handleDeleteKB = (kb: IKnowledgeBase) => {
    setKbToDelete(kb);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!kbToDelete) return;

    const success = await deleteKnowledgeBase(kbToDelete.id);

    if (success) {
      setDeleteConfirmOpen(false);
      setKbToDelete(null);
    }
  };

  const handleSelectKB = (kb: IKnowledgeBase) => {
    selectKnowledgeBase(kb);
  };

  const handleCloseDialog = () => {
    setCreateDialogOpen(false);
    setEditingKB(null);
    setKbName('');
    setKbDescription('');
    setDialogTopics([]);
  };

  const handleRemoveDialogTopic = (topicId: number) => {
    setDialogTopics(prev => prev.filter(topic => topic.id !== topicId));
  };

  return (
    <>
      <Card sx={{ height: 'fit-content', position: 'sticky', top: 4 }}>
        <CardHeader
          avatar={<FolderIcon />}
          title="知识库管理"
          titleTypographyProps={{ variant: 'h6' }}
        />
        <CardContent>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setDialogTopics([...selectedTopics]);
              setCreateDialogOpen(true);
            }}
            fullWidth
            sx={{ mb: 2 }}
          >
            创建知识库
          </Button>

          <Divider sx={{ mb: 2 }} />

          {selectedKnowledgeBase && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
              <Typography variant="subtitle2" color="primary.contrastText">
                当前选中: {selectedKnowledgeBase.name}
              </Typography>
              <Typography variant="body2" color="primary.contrastText">
                {selectedKnowledgeBase.topics.length} 个帖子
              </Typography>
            </Box>
          )}

          <List sx={{ maxHeight: 400, overflow: 'auto' }}>
            {knowledgeBases.map((kb) => (
              <ListItem
                key={kb.id}
                button
                onClick={() => handleSelectKB(kb)}
                selected={selectedKnowledgeBase?.id === kb.id}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1, mb: 1 }}
              >
                <ListItemText
                  primary={kb.name}
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {kb.description || '无描述'}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        <Chip
                          label={`${kb.topics.length} 个帖子`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          {kb.updatedAt.toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditKB(kb);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteKB(kb);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {knowledgeBases.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
              <FolderIcon sx={{ fontSize: 48, opacity: 0.5 }} />
              <Typography>还没有知识库</Typography>
              <Typography variant="body2">
                创建您的第一个知识库
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* 创建/编辑知识库对话框 */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingKB ? '编辑知识库' : '创建知识库'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="知识库名称"
            fullWidth
            variant="outlined"
            value={kbName}
            onChange={(e) => setKbName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="描述（可选）"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={kbDescription}
            onChange={(e) => setKbDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          
          <Typography variant="h6" sx={{ mb: 2 }}>
            选择帖子
          </Typography>
          
          <Reference
            selectedTopics={dialogTopics}
            setSelectedTopics={setDialogTopics}
            accessToken={accessToken}
          />
          
          {dialogTopics.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                已选择的帖子 ({dialogTopics.length}):
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {dialogTopics.map((topic) => (
                  <Chip
                    key={topic.id}
                    label={`${topic.label} (${topic.replyCount}回复)`}
                    onDelete={() => handleRemoveDialogTopic(topic.id)}
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
              </Box>
            </Box>
          )}
          
          {dialogTopics.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              请先搜索并选择帖子
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button
            onClick={editingKB ? handleUpdateKB : handleCreateKB}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={dialogTopics.length === 0 || !kbName.trim()}
          >
            {editingKB ? '更新' : '创建'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>确认删除</DialogTitle>
        <DialogContent>
          <Typography>
            确定要删除知识库 &quot;{kbToDelete?.name}&quot; 吗？此操作不可撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 