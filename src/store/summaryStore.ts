import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { IChatMessage, IReferenceProps, IKnowledgeBase } from '@/app/summary/types';
import { POST, GET } from '@/request';
import { IGeneralResponse, ISummaryRequest } from '@request/api';
import { getCurrentCount, increaseCurrentCount } from '@/utils/limitation';
import { MAX_CALL_PER_USER } from '../../config';
import { requestQueue } from '@/utils/requestQueue';
import { securityFilter } from '@/utils/securityFilter';
import { API_ROOT } from '../../config';
import { IPost, ITopic, ITopicGroup } from '@cc98/api';
import { getFavouriteTopicGroup, getFavouriteTopicContent, getAFavouriteTopicContent } from '@/utils/getFavouriteTopic';
import type { Message } from 'ai';

interface SummaryState {
  // 基础状态
  feedback: string;
  question: string;
  loading: boolean;
  selectedTopics: IReferenceProps[];
  messages: IChatMessage[];
  
  // 知识库状态（只读）
  knowledgeBases: IKnowledgeBase[];
  selectedKnowledgeBase: IKnowledgeBase | null;
  
  // Vercel AI SDK相关状态
  aiMessages: Message[];
  knowledgeBaseContent: string;
  
  // 操作方法
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
  setQuestion: (question: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTopics: (topics: IReferenceProps[] | ((prev: IReferenceProps[]) => IReferenceProps[])) => void;
  addMessage: (type: 'user' | 'bot' | 'system', content: string, topicTitles?: string[]) => void;
  clearMessages: () => void;
  
  // 知识库操作（简化为只读）
  setKnowledgeBases: (kbs: IKnowledgeBase[] | ((prev: IKnowledgeBase[]) => IKnowledgeBase[])) => void;
  setSelectedKnowledgeBase: (kb: IKnowledgeBase | null) => void;
  loadKnowledgeBases: (accessToken: string) => Promise<void>;
  selectKnowledgeBase: (kb: IKnowledgeBase) => void;
  
  // 业务逻辑
  removeTopic: (topicId: number) => void;
  submitQuestion: (accessToken: string) => Promise<void>;
  
  // Vercel AI SDK相关操作
  setAiMessages: (messages: Message[]) => void;
  setKnowledgeBaseContent: (content: string) => void;
  getKnowledgeBaseForAI: (accessToken: string) => Promise<string>;
  
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

// 将收藏帖子组转换为知识库
const convertFavoriteGroupToKnowledgeBase = async (
  group: ITopicGroup, 
  accessToken: string
): Promise<IKnowledgeBase> => {
  try {
    // 获取该收藏组下的帖子列表
    const topics = await getAFavouriteTopicContent(group, accessToken);
    
    const knowledgeBaseTopics: IReferenceProps[] = topics.map(topic => ({
      id: topic.id,
      label: topic.title,
      replyCount: topic.replyCount
    }));

    const now = new Date();
    return {
      id: `favorite_group_${group.id}`,
      name: group.name,
      description: `基于收藏帖子组"${group.name}"自动生成的知识库`,
      topics: knowledgeBaseTopics,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error(`转换收藏组 ${group.name} 失败:`, error);
    const errorNow = new Date();
    return {
      id: `favorite_group_${group.id}`,
      name: group.name,
      description: `基于收藏帖子组"${group.name}"自动生成的知识库（加载失败）`,
      topics: [],
      createdAt: errorNow,
      updatedAt: errorNow
    };
  }
};

// 初始消息
const initialMessage: IChatMessage = {
  id: '1',
  type: 'system',
  content: '您好！我是CC98智能助手，可以帮您基于收藏的帖子内容回答问题。系统已自动为您生成基于收藏帖子组的知识库，请选择知识库后输入您的问题。',
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
        
        // Vercel AI SDK相关状态
        aiMessages: [],
        knowledgeBaseContent: '',

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

        // 知识库操作（简化为只读）
        setKnowledgeBases: (kbs) => set((state) => ({
          knowledgeBases: typeof kbs === 'function' ? kbs(state.knowledgeBases) : kbs
        })),
        
        setSelectedKnowledgeBase: (kb) => set({ selectedKnowledgeBase: kb }),
        
        loadKnowledgeBases: async (accessToken: string) => {
          try {
            const { setFeedback } = get();
            
            // 获取用户收藏帖子组
            const favoriteGroups = await getFavouriteTopicGroup(accessToken);
            
            if (favoriteGroups.length === 0) {
              setFeedback('您还没有收藏帖子组，请先在论坛中收藏一些帖子');
              set({ knowledgeBases: [] });
              return;
            }

            // 将收藏帖子组转换为知识库
            const knowledgeBases = await Promise.all(
              favoriteGroups.map(group => convertFavoriteGroupToKnowledgeBase(group, accessToken))
            );

            set({ knowledgeBases });
            setFeedback(`已自动生成 ${knowledgeBases.length} 个基于收藏帖子的知识库`);
          } catch (error) {
            console.error('加载收藏帖子失败:', error);
            get().setFeedback('加载收藏帖子失败，请检查网络连接');
            set({ knowledgeBases: [] });
          }
        },
        
        selectKnowledgeBase: (kb) => {
          const { setFeedback } = get();
          set({ 
            selectedKnowledgeBase: kb, 
            selectedTopics: kb.topics 
          });
          setFeedback(`已选择知识库: ${kb.name}`);
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
            setFeedback("请先选择知识库");
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

        // Vercel AI SDK相关操作
        setAiMessages: (messages) => set({ aiMessages: messages }),
        
        setKnowledgeBaseContent: (content) => set({ knowledgeBaseContent: content }),
        
        getKnowledgeBaseForAI: async (accessToken) => {
          const { selectedTopics } = get();
          if (selectedTopics.length === 0) return '';
          
          try {
            const content = await getMultipleTopics(accessToken, selectedTopics);
            get().setKnowledgeBaseContent(content);
            return content;
          } catch (error) {
            console.error('获取知识库内容失败:', error);
            return '';
          }
        },

        // 重置状态
        reset: () => set({
          feedback: '',
          question: '',
          loading: false,
          selectedTopics: [],
          messages: [initialMessage],
          selectedKnowledgeBase: null,
          aiMessages: [],
          knowledgeBaseContent: ''
        })
      }),
      {
        name: 'summary-store',
        partialize: (state) => ({
          selectedKnowledgeBase: state.selectedKnowledgeBase
        })
      }
    )
  )
); 