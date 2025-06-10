export interface IReferenceProps {
  label: string;
  id: number;
  replyCount: number;
}

export interface IKnowledgeBase {
  id: string;
  name: string;
  description: string;
  topics: IReferenceProps[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatMessage {
  id: string;
  type: 'user' | 'bot' | 'system';
  content: string;
  timestamp: Date;
  topicTitles?: string[];
}

export interface ISummaryPageContentProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  question: string;
  setQuestion: (question: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  selectedTopics: IReferenceProps[];
  setSelectedTopics: React.Dispatch<React.SetStateAction<IReferenceProps[]>>;
  messages: IChatMessage[];
  addMessage: (type: 'user' | 'bot', content: string, topicTitles?: string[]) => void;
  clearFeedback: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  knowledgeBases: IKnowledgeBase[];
  setKnowledgeBases: React.Dispatch<React.SetStateAction<IKnowledgeBase[]>>;
  selectedKnowledgeBase: IKnowledgeBase | null;
  setSelectedKnowledgeBase: React.Dispatch<React.SetStateAction<IKnowledgeBase | null>>;
} 