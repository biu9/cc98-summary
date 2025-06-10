import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { IChatMessage, IReferenceProps, IKnowledgeBase } from '@/app/summary/types';
import { KnowledgeBaseManager } from '@/utils/knowledgeBaseManager';
import { POST, GET } from '@/request';
import { IGeneralResponse, ISummaryRequest } from '@request/api';
import { getCurrentCount, increaseCurrentCount } from '@/utils/limitation';
import { MAX_CALL_PER_USER } from '../../config';
import { requestQueue } from '@/utils/requestQueue';
import { securityFilter } from '@/utils/securityFilter';
import { API_ROOT } from '../../config';
import { IPost } from '@cc98/api';

interface SummaryState {
  // 基础状态
  feedback: string;
  question: string;
  loading: boolean;
  selectedTopics: IReferenceProps[];
  messages: IChatMessage[];
  
  // 知识库状态
  knowledgeBases: IKnowledgeBase[];
  selectedKnowledgeBase: IKnowledgeBase | null;
  
  // 操作方法
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
  setQuestion: (question: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTopics: (topics: IReferenceProps[] | ((prev: IReferenceProps[]) => IReferenceProps[])) => void;
  addMessage: (type: 'user' | 'bot' | 'system', content: string, topicTitles?: string[]) => void;
  clearMessages: () => void;
  
  // 知识库操作
  setKnowledgeBases: (kbs: IKnowledgeBase[] | ((prev: IKnowledgeBase[]) => IKnowledgeBase[])) => void;
  setSelectedKnowledgeBase: (kb: IKnowledgeBase | null) => void;
  loadKnowledgeBases: () => void;
  createKnowledgeBase: (name: string, description: string, topics: IReferenceProps[]) => Promise<boolean>;
  updateKnowledgeBase: (kb: IKnowledgeBase) => Promise<boolean>;
  deleteKnowledgeBase: (id: string) => Promise<boolean>;
  selectKnowledgeBase: (kb: IKnowledgeBase) => void;
  
  // 业务逻辑
  removeTopic: (topicId: number) => void;
  submitQuestion: (accessToken: string) => Promise<void>;
  
  // 重置状态
  reset: () => void;
}

// 获取帖子内容的辅助函数
const getTopic = async (token: string, topicId: number, replyCount: number): Promise<string> => {
  let text = '';
  const PageSize = 10;
  const topicArr: (() => Promise<IPost[]>)[] = [];
  
  for (let i = 0; i < Math.ceil(replyCount / PageSize); i++) {
    topicArr.push(async () => {
      const data = await GET<IPost[]>(`${API_ROOT}/Topic/${topicId}/post?from=${i * PageSize}&size=${PageSize}&sf_request_type=fetch`, token);
      return data;
    });
  }
  
  const topicData = await requestQueue<IPost[]>(topicArr);
  topicData.forEach((post: IPost[]) => {
    text += post.map(item => item.userName + ':' + securityFilter(item.content)).join('\n\n') + '\n\n';
  });

  return text;
};

// 获取多个帖子内容
const getMultipleTopics = async (token: string, topics: IReferenceProps[]): Promise<string> => {
  const topicsContent = await Promise.all(
    topics.map(async (topic) => {
      const content = await getTopic(token, topic.id, topic.replyCount);
      return `帖子标题: ${topic.label}\n内容: ${content}`;
    })
  );
  return topicsContent.join('\n\n=== 分隔线 ===\n\n');
};

// 生成问题
const generateQuestion = (topicContent: string, question: string): string => {
  return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`;
};

// 初始消息
const initialMessage: IChatMessage = {
  id: '1',
  type: 'system',
  content: '您好！我是CC98智能助手，可以帮您基于论坛帖子内容回答问题。您可以选择使用已保存的知识库，或手动选择帖子，然后输入您的问题。',
  timestamp: new Date()
};

export const useSummaryStore = create<SummaryState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        feedback: '',
        question: '',
        loading: false,
        selectedTopics: [],
        messages: [initialMessage],
        knowledgeBases: [],
        selectedKnowledgeBase: null,

        // 基础操作
        setFeedback: (feedback: string) => set({ feedback }),
        clearFeedback: () => set({ feedback: '' }),
        setQuestion: (question: string) => set({ question }),
        setLoading: (loading: boolean) => set({ loading }),
        
        setSelectedTopics: (topics) => set((state) => ({
          selectedTopics: typeof topics === 'function' ? topics(state.selectedTopics) : topics
        })),
        
        addMessage: (type, content, topicTitles) => {
          const newMessage: IChatMessage = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            topicTitles
          };
          set((state) => ({
            messages: [...state.messages, newMessage]
          }));
        },
        
        clearMessages: () => set({ messages: [initialMessage] }),

        // 知识库操作
        setKnowledgeBases: (kbs) => set((state) => ({
          knowledgeBases: typeof kbs === 'function' ? kbs(state.knowledgeBases) : kbs
        })),
        
        setSelectedKnowledgeBase: (kb) => set({ selectedKnowledgeBase: kb }),
        
        loadKnowledgeBases: () => {
          const kbs = KnowledgeBaseManager.getAll();
          set({ knowledgeBases: kbs });
        },
        
        createKnowledgeBase: async (name, description, topics) => {
          const { knowledgeBases, setFeedback } = get();
          
          if (KnowledgeBaseManager.isNameExists(name)) {
            setFeedback('知识库名称已存在');
            return false;
          }
          
          const newKB = KnowledgeBaseManager.create(name, description, topics);
          const success = KnowledgeBaseManager.save(newKB);
          
          if (success) {
            set({ knowledgeBases: [...knowledgeBases, newKB] });
            setFeedback('知识库创建成功');
            return true;
          } else {
            setFeedback('创建知识库失败');
            return false;
          }
        },
        
        updateKnowledgeBase: async (updatedKB) => {
          const { knowledgeBases, selectedKnowledgeBase, setFeedback, setSelectedTopics } = get();
          
          const success = KnowledgeBaseManager.save(updatedKB);
          
          if (success) {
            const newKBs = knowledgeBases.map(kb => kb.id === updatedKB.id ? updatedKB : kb);
            set({ knowledgeBases: newKBs });
            
            // 如果当前选中的是这个知识库，更新选中状态
            if (selectedKnowledgeBase?.id === updatedKB.id) {
              set({ selectedKnowledgeBase: updatedKB });
              setSelectedTopics(updatedKB.topics);
            }
            
            setFeedback('知识库更新成功');
            return true;
          } else {
            setFeedback('更新知识库失败');
            return false;
          }
        },
        
        deleteKnowledgeBase: async (id) => {
          const { knowledgeBases, selectedKnowledgeBase, setFeedback } = get();
          
          const success = KnowledgeBaseManager.delete(id);
          
          if (success) {
            const newKBs = knowledgeBases.filter(kb => kb.id !== id);
            set({ knowledgeBases: newKBs });
            
            // 如果删除的是当前选中的知识库，清除选中状态
            if (selectedKnowledgeBase?.id === id) {
              set({ selectedKnowledgeBase: null, selectedTopics: [] });
            }
            
            setFeedback('知识库删除成功');
            return true;
          } else {
            setFeedback('删除知识库失败');
            return false;
          }
        },
        
        selectKnowledgeBase: (kb) => {
          const { setFeedback } = get();
          set({ 
            selectedKnowledgeBase: kb, 
            selectedTopics: kb.topics 
          });
          setFeedback(`已切换到知识库: ${kb.name}`);
        },

        // 业务逻辑
        removeTopic: (topicId) => {
          const { selectedKnowledgeBase, setFeedback, setSelectedTopics } = get();
          
          if (selectedKnowledgeBase) {
            setFeedback("注意：您正在移除知识库中的帖子，这不会影响原知识库的内容");
          }
          
          setSelectedTopics(prev => prev.filter(topic => topic.id !== topicId));
        },
        
        submitQuestion: async (accessToken) => {
          const { 
            question, 
            selectedTopics, 
            selectedKnowledgeBase, 
            setFeedback, 
            setLoading, 
            setQuestion, 
            addMessage 
          } = get();
          
          if (getCurrentCount() >= MAX_CALL_PER_USER) {
            setFeedback("今日测试次数已用完,请明日再试");
            return;
          }

          if (selectedTopics.length === 0) {
            setFeedback("请先选择知识库或参考帖子");
            return;
          }

          if (!question.trim()) {
            setFeedback("请输入问题");
            return;
          }

          const topicTitles = selectedTopics.map(topic => topic.label);
          const contextInfo = selectedKnowledgeBase 
            ? [`知识库: ${selectedKnowledgeBase.name}`, ...topicTitles]
            : topicTitles;
          
          addMessage('user', question, contextInfo);

          setLoading(true);
          setQuestion("");

          try {
            const topicContent = await getMultipleTopics(accessToken, selectedTopics);
            const contextDescription = selectedKnowledgeBase 
              ? `基于知识库"${selectedKnowledgeBase.name}"`
              : "基于选定的参考帖子";
            
            const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
              text: generateQuestion(topicContent, `${contextDescription}回答问题: ${question}`),
            });

            if (res.isOk) {
              addMessage('bot', res.data);
              increaseCurrentCount();
            } else {
              setFeedback(res.msg);
            }
          } catch (error) {
            setFeedback("发生错误，请重试");
          }

          setLoading(false);
        },

        // 重置状态
        reset: () => set({
          feedback: '',
          question: '',
          loading: false,
          selectedTopics: [],
          messages: [initialMessage],
          selectedKnowledgeBase: null
        })
      }),
      {
        name: 'summary-store',
        partialize: (state) => ({
          knowledgeBases: state.knowledgeBases,
          selectedKnowledgeBase: state.selectedKnowledgeBase
        })
      }
    )
  )
); 