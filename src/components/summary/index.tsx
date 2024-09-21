import { Paper, Input, Button, CircularProgress, Autocomplete, TextField } from "@mui/material";
import { SetStateAction, useCallback, useContext, useEffect, useState } from "react";
import { IGeneralResponse, ISummaryRequest } from "@request/api";
import { GET, POST } from "@/request";
import { FeedbackContext } from "@/store/feedBackContext";
import { debounce } from "@/utils/debounce";
import { API_ROOT } from "../../../config";
import { useAuth } from "react-oidc-context";
import { IPost, ITopic } from "@cc98/api";
import { requestQueue } from "@/utils/requestQueue";
import { securityFilter } from "@/utils/securityFilter";

type ReferenceProps = {
  label: string;
  id: number;
  replyCount: number;
}

const Reference = ({ setSelectedTopic }: { setSelectedTopic: React.Dispatch<SetStateAction<ReferenceProps | null>> }) => {

  const [reference, setReference] = useState<ReferenceProps[]>([]);
  const [composing, setComposing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const auth = useAuth();

  const fetchOptions = async (value: string) => {
    if (!value) return;
    const res: ITopic[] = await GET(`${API_ROOT}/topic/search?keyword=${value}&size=20&from=0`, auth.user?.access_token);
    setReference(res.map(item => {
      return {
        label: item.title,
        id: item.id,
        replyCount: item.replyCount
      }
    }));
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetch = useCallback(debounce(fetchOptions, 10000, true), []); // 如果不加useCallback,每次页面初始化的时候都会初始化一个新的debouce函数,让依赖于闭包的防抖失效

  const handleInput = (event: React.SyntheticEvent, value: string) => {
    setInputValue(value);
    if (composing)
      return;
    debouncedFetch(value);
  }

  const onCompositionEnd = () => {
    setComposing(false);
    debouncedFetch(inputValue);
  }

  return (
    <Autocomplete
      options={reference}
      renderInput={(params) => <TextField {...params} label="请输入参考帖子" variant="standard" />}
      onInputChange={handleInput}
      className="md:w-[400px] w-full"
      onCompositionStart={() => setComposing(true)}
      onCompositionEnd={onCompositionEnd}
      onChange={(e, value) => {
        setSelectedTopic(value);
      }}
    />
  )

}

export default function Summary() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<ReferenceProps | null>(null);

  const auth = useAuth();

  const feedbackContext = useContext(FeedbackContext);
  const setFeedback = feedbackContext?.setFeedback;

  const getTopic = async(token: string, topicId?: number, replyCount?: number) => {
    if(!topicId || !replyCount)  return '';

    let text = '';
    const PageSize = 10;
    const topicArr: (() => Promise<IPost[]>)[] = [];
    for(let i=0; i<Math.ceil(replyCount/PageSize); i++) {
      topicArr.push(async () => {
        const data = await GET<IPost[]>(`${API_ROOT}/Topic/${topicId}/post?from=${i*PageSize}&size=${PageSize}`,token);
        return data;
      })
    }
    const topicData = await requestQueue<IPost[]>(topicArr);
    topicData.forEach((post:IPost[]) => {
      text += post.map(item => item.userName + ':' + securityFilter(item.content)).join('\n\n') + '\n\n';
    })

    return text;
  }

  const generateQuestion = (topicContent: string, question: string) => {
    return `请根据给出的知识库回答对应的问题: 知识库${topicContent},问题: ${question}`
  }

  const handleSubmit = async () => {
    setLoading(true);
    const topicContent = await getTopic(auth.user?.access_token!, selectedTopic?.id, selectedTopic?.replyCount);
    const res = await POST<ISummaryRequest, IGeneralResponse>("/api/summary", {
      text: generateQuestion(topicContent, question),
    });
    if (res.isOk) {
      setSummary(res.data);
    } else {
      setFeedback && setFeedback(res.msg);
    }
    setLoading(false);
  };

  return (
    <div>
      <Paper sx={{ p: 2 }}>
        <div className="flex md:items-end gap-2 md:justify-between md:space-x-6 md:flex-row flex-col justify-center items-start">
          <Reference
            setSelectedTopic={setSelectedTopic}
          />
          <Input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="请输入问题"
            className="flex-1"
            fullWidth
          />
          <Button onClick={handleSubmit}>
            {loading ? <CircularProgress size={24} /> : "生成"}
          </Button>
        </div>
      </Paper>
      {summary && <Paper sx={{ p: 2, mt: 2 }}>
        {summary && <div className="text-sm text-gray-500">{summary}</div>}
      </Paper>}
    </div>
  );
}
