declare module "@page/summary" {
  export interface IReferenceProps {
    label: string;
    id: number;
    replyCount: number;
  }

  export interface IChatMessage {
    id: string;
    type: 'user' | 'bot' | 'system';
    content: string;
    timestamp: Date;
    topicTitle?: string;
  }

  export interface ISummaryPageContentProps {
    feedback: string;
    setFeedback: (msg: string) => void;
    question: string;
    setQuestion: (q: string) => void;
    loading: boolean;
    setLoading: (l: boolean) => void;
    selectedTopic: IReferenceProps | null;
    setSelectedTopic: React.Dispatch<SetStateAction<IReferenceProps | null>>;
    messages: IChatMessage[];
    addMessage: (type: 'user' | 'bot', content: string, topicTitle?: string) => void;
    clearFeedback: () => void;
    messagesEndRef: React.RefObject<HTMLDivElement>;
  }
}