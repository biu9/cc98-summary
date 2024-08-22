import { Paper, Input, Button, CircularProgress } from "@mui/material";
import { useContext, useState } from "react";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { POST } from "@/request";
import { FeedbackContext } from "@/store/feedBackContext";

export default function Summary() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");

  const feedbackContext = useContext(FeedbackContext);
  const setFeedback = feedbackContext?.setFeedback;

  const handleSubmit = async () => {
    setLoading(true);
    const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
      text: question,
    });
    if (res.isOk) {
      setSummary(res.data);
    } else {
      setFeedback && setFeedback(res.msg);
    }
    setLoading(false);
  };

  return (
    <Paper sx={{ p: 2 }}>
      {summary && <div className="text-sm text-gray-500 mb-10">{summary}</div>}
      <div className="flex items-center gap-2 justify-between space-x-6">
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入问题"
          className="w-full"
        />
        <Button onClick={handleSubmit}>
          {loading ? <CircularProgress size={24} /> : "生成"}
        </Button>
      </div>
    </Paper>
  );
}
