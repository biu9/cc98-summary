import { createContext } from "react";

type FeedbackContextType = {
    feedback: string;
    setFeedback: (feedback: string) => void;
  }

export const FeedbackContext = createContext<FeedbackContextType | null>(null);
