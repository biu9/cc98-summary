import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Message } from "ai";
import { GET, POST } from "@/request";
import { API_ROOT, MAX_CALL_PER_USER } from "../../config";
import {
  IChatMessage,
  IKnowledgeBase,
  IReferenceProps,
} from "@/app/summary/types";
import { getCurrentCount, increaseCurrentCount } from "@/utils/limitation";
import { requestQueue } from "@/utils/requestQueue";
import { securityFilter } from "@/utils/securityFilter";
import {
  getAFavouriteTopicContent,
  getFavouriteTopicGroup,
} from "@/utils/getFavouriteTopic";
import { KnowledgeBaseManager } from "@/utils/knowledgeBaseManager";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { IPost, ITopicGroup } from "@cc98/api";

interface SummaryState {
  feedback: string;
  question: string;
  loading: boolean;
  selectedTopics: IReferenceProps[];
  messages: IChatMessage[];
  knowledgeBases: IKnowledgeBase[];
  selectedKnowledgeBase: IKnowledgeBase | null;
  aiMessages: Message[];
  knowledgeBaseContent: string;
  setFeedback: (feedback: string) => void;
  clearFeedback: () => void;
  setQuestion: (question: string) => void;
  setLoading: (loading: boolean) => void;
  setSelectedTopics: (
    topics:
      | IReferenceProps[]
      | ((prev: IReferenceProps[]) => IReferenceProps[])
  ) => void;
  addMessage: (
    type: "user" | "bot" | "system",
    content: string,
    topicTitles?: string[]
  ) => void;
  clearMessages: () => void;
  setKnowledgeBases: (
    knowledgeBases:
      | IKnowledgeBase[]
      | ((prev: IKnowledgeBase[]) => IKnowledgeBase[])
  ) => void;
  setSelectedKnowledgeBase: (knowledgeBase: IKnowledgeBase | null) => void;
  loadKnowledgeBases: (accessToken: string) => Promise<void>;
  selectKnowledgeBase: (knowledgeBase: IKnowledgeBase) => void;
  removeTopic: (topicId: number) => void;
  submitQuestion: (accessToken: string) => Promise<void>;
  setAiMessages: (messages: Message[]) => void;
  setKnowledgeBaseContent: (content: string) => void;
  getKnowledgeBaseForAI: (accessToken: string) => Promise<string>;
  reset: () => void;
}

const getTopic = async (
  token: string,
  topicId: number,
  replyCount: number
): Promise<string> => {
  let text = "";
  const pageSize = 10;
  const topicRequests: Array<() => Promise<IPost[]>> = [];

  for (let i = 0; i < Math.ceil(replyCount / pageSize); i += 1) {
    topicRequests.push(async () => {
      const data = await GET<IPost[]>(
        `${API_ROOT}/Topic/${topicId}/post?from=${i * pageSize}&size=${pageSize}&sf_request_type=fetch`,
        token
      );
      return data;
    });
  }

  const topicData = await requestQueue<IPost[]>(topicRequests);
  topicData.forEach((posts: IPost[]) => {
    text +=
      posts
        .map((item) => `${item.userName}:${securityFilter(item.content)}`)
        .join("\n\n") + "\n\n";
  });

  return text;
};

const getMultipleTopics = async (
  token: string,
  topics: IReferenceProps[]
): Promise<string> => {
  const topicContents = await Promise.all(
    topics.map(async (topic) => {
      const content = await getTopic(token, topic.id, topic.replyCount);
      return `帖子标题：${topic.label}\n内容：${content}`;
    })
  );

  return topicContents.join("\n\n=== 分隔线 ===\n\n");
};

const generateQuestion = (topicContent: string, question: string): string => {
  return `请根据给出的知识库内容回答对应问题。知识库：${topicContent}。问题：${question}`;
};

const convertFavoriteGroupToKnowledgeBase = async (
  group: ITopicGroup,
  accessToken: string
): Promise<IKnowledgeBase> => {
  try {
    const topics = await getAFavouriteTopicContent(group, accessToken);

    const knowledgeBaseTopics: IReferenceProps[] = topics.map((topic) => ({
      id: topic.id,
      label: topic.title,
      replyCount: topic.replyCount,
    }));

    const now = new Date();
    return {
      id: `favorite_group_${group.id}`,
      name: group.name,
      description: `基于收藏分组“${group.name}”自动生成的知识库`,
      topics: knowledgeBaseTopics,
      createdAt: now,
      updatedAt: now,
    };
  } catch (error) {
    console.error(`转换收藏分组 ${group.name} 失败:`, error);
    const now = new Date();
    return {
      id: `favorite_group_${group.id}`,
      name: group.name,
      description: `基于收藏分组“${group.name}”自动生成的知识库（加载失败）`,
      topics: [],
      createdAt: now,
      updatedAt: now,
    };
  }
};

const initialMessage: IChatMessage = {
  id: "1",
  type: "system",
  content:
    "你好，我是 CC98 智能助手，可以基于你的收藏帖子内容回答问题。请先选择一个知识库，再输入你想追问的问题。",
  timestamp: new Date(),
};

export const useSummaryStore = create<SummaryState>()(
  devtools(
    persist(
      (set, get) => ({
        feedback: "",
        question: "",
        loading: false,
        selectedTopics: [],
        messages: [initialMessage],
        knowledgeBases: [],
        selectedKnowledgeBase: null,
        aiMessages: [],
        knowledgeBaseContent: "",

        setFeedback: (feedback: string) => set({ feedback }),
        clearFeedback: () => set({ feedback: "" }),
        setQuestion: (question: string) => set({ question }),
        setLoading: (loading: boolean) => set({ loading }),
        setSelectedTopics: (topics) =>
          set((state) => ({
            selectedTopics:
              typeof topics === "function" ? topics(state.selectedTopics) : topics,
          })),
        addMessage: (type, content, topicTitles) => {
          const newMessage: IChatMessage = {
            id: Date.now().toString(),
            type,
            content,
            timestamp: new Date(),
            topicTitles,
          };

          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        },
        clearMessages: () => set({ messages: [initialMessage] }),

        setKnowledgeBases: (knowledgeBases) =>
          set((state) => ({
            knowledgeBases:
              typeof knowledgeBases === "function"
                ? knowledgeBases(state.knowledgeBases)
                : knowledgeBases,
          })),
        setSelectedKnowledgeBase: (selectedKnowledgeBase) =>
          set({ selectedKnowledgeBase }),

        loadKnowledgeBases: async (accessToken: string) => {
          try {
            const localKnowledgeBases =
              typeof window !== "undefined" ? KnowledgeBaseManager.getAll() : [];
            const favoriteGroups = await getFavouriteTopicGroup(accessToken);

            if (favoriteGroups.length === 0 && localKnowledgeBases.length === 0) {
              get().setFeedback(
                "你还没有收藏分组，请先在 CC98 中收藏一些帖子。"
              );
              set({ knowledgeBases: [] });
              return;
            }

            const favoriteKnowledgeBases = await Promise.all(
              favoriteGroups.map((group) =>
                convertFavoriteGroupToKnowledgeBase(group, accessToken)
              )
            );

            const knowledgeBases = [
              ...localKnowledgeBases,
              ...favoriteKnowledgeBases,
            ];

            set({ knowledgeBases });
            if (favoriteKnowledgeBases.length > 0 && localKnowledgeBases.length > 0) {
              get().setFeedback(
                `已加载 ${favoriteKnowledgeBases.length} 个收藏知识库和 ${localKnowledgeBases.length} 个本地知识库。`
              );
            } else if (favoriteKnowledgeBases.length > 0) {
              get().setFeedback(
                `已自动生成 ${favoriteKnowledgeBases.length} 个基于收藏分组的知识库。`
              );
            } else {
              get().setFeedback(
                `已加载 ${localKnowledgeBases.length} 个本地知识库。`
              );
            }
          } catch (error) {
            console.error("加载收藏帖子失败:", error);
            get().setFeedback("加载收藏帖子失败，请检查网络连接后重试。");
            set({ knowledgeBases: [] });
          }
        },

        selectKnowledgeBase: (knowledgeBase) => {
          set({
            selectedKnowledgeBase: knowledgeBase,
            selectedTopics: knowledgeBase.topics,
          });
          get().setFeedback(`已选择知识库：${knowledgeBase.name}`);
        },

        removeTopic: (topicId) => {
          const { selectedKnowledgeBase, setFeedback, setSelectedTopics } = get();

          if (selectedKnowledgeBase) {
            setFeedback(
              "你正在移除知识库中的参考帖子，这不会影响原始收藏分组。"
            );
          }

          setSelectedTopics((prev) =>
            prev.filter((topic) => topic.id !== topicId)
          );
        },

        submitQuestion: async (accessToken) => {
          const {
            question,
            selectedTopics,
            selectedKnowledgeBase,
            setFeedback,
            setLoading,
            setQuestion,
            addMessage,
          } = get();

          if (getCurrentCount() >= MAX_CALL_PER_USER) {
            setFeedback("今日调用次数已用完，请明天再试。");
            return;
          }

          if (selectedTopics.length === 0) {
            setFeedback("请先选择一个知识库。");
            return;
          }

          if (!question.trim()) {
            setFeedback("请输入一个问题。");
            return;
          }

          const topicTitles = selectedTopics.map((topic) => topic.label);
          const contextInfo = selectedKnowledgeBase
            ? [`知识库：${selectedKnowledgeBase.name}`, ...topicTitles]
            : topicTitles;

          addMessage("user", question, contextInfo);
          setLoading(true);
          setQuestion("");

          try {
            const topicContent = await getMultipleTopics(accessToken, selectedTopics);
            const contextDescription = selectedKnowledgeBase
              ? `基于知识库“${selectedKnowledgeBase.name}”`
              : "基于当前选中的参考帖子";

            const res = await POST<ISummaryRequest, IGeneralResponse>(
              "/api/summary",
              {
                text: generateQuestion(
                  topicContent,
                  `${contextDescription}回答问题：${question}`
                ),
              }
            );

            if (res.isOk) {
              addMessage("bot", res.data);
              increaseCurrentCount();
            } else {
              setFeedback(res.msg);
            }
          } catch (error) {
            setFeedback("生成回答时发生错误，请稍后重试。");
          }

          setLoading(false);
        },

        setAiMessages: (aiMessages) => set({ aiMessages }),
        setKnowledgeBaseContent: (knowledgeBaseContent) =>
          set({ knowledgeBaseContent }),
        getKnowledgeBaseForAI: async (accessToken) => {
          const { selectedTopics } = get();
          if (selectedTopics.length === 0) return "";

          try {
            const content = await getMultipleTopics(accessToken, selectedTopics);
            get().setKnowledgeBaseContent(content);
            return content;
          } catch (error) {
            console.error("获取知识库内容失败:", error);
            return "";
          }
        },

        reset: () =>
          set({
            feedback: "",
            question: "",
            loading: false,
            selectedTopics: [],
            messages: [initialMessage],
            knowledgeBases: [],
            selectedKnowledgeBase: null,
            aiMessages: [],
            knowledgeBaseContent: "",
          }),
      }),
      {
        name: "summary-store",
        partialize: (state) => ({
          selectedKnowledgeBase: state.selectedKnowledgeBase,
        }),
      }
    )
  )
);
