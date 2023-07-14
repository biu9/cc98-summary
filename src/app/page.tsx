"use client";
import LoadingButton from "@mui/lab/LoadingButton";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  useState,
  useLayoutEffect,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
import { AuthProvider, useAuth, AuthContextProps } from "react-oidc-context";
import { Button } from "@mui/material";
import { OIDC_CONFIG, PROMPT } from "../../config";
import summary from "@/utils/getSummary";
import getTopicContent from "@/utils/getAllTopic";

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

let messages = [
  { role: "system", content: PROMPT },
  { role: "user", content: "" },
];

const HomeContent = () => {
  const [summary, setSummary] = useState<string>("");

  const auth = useAuth();

  return (
    <div className="font-mono flex justify-center items-center flex-col min-h-screen space-y-5 ">
      <div className="text-7xl mb-20">CC98 summary</div>
      {auth.isAuthenticated ? (
        <GetSummary auth={auth} setSummary={setSummary} />
      ) : (
        <UnLogin auth={auth} />
      )}
      {summary ? <SummaryContent content={summary} /> : null}
    </div>
  );
};

const SummaryContent = ({ content }: { content: string }) => {
  return (
    <div className="w-96 border-2 p-6 border-black rounded-xl break-words">
      <div className="text-xl font-bold">总结结果</div>
      {content}
    </div>
  );
};

const GetSummary = ({
  auth,
  setSummary,
}: {
  auth: AuthContextProps;
  setSummary: Dispatch<SetStateAction<string>>;
}) => {
  const [loading, setLoading] = useState(false);
  const [getTopicsFinished, setGetTopicsFinished] = useState(false);

  useLayoutEffect(() => {
    (async () => {
      if (auth.user?.access_token) {
        const topicContent = await getTopicContent(auth.user?.access_token);
        messages[1].content = topicContent;
        console.log("message", messages[1].content);
        setGetTopicsFinished(true);
      } else {
        setSummary("access_token is not defined");
        throw new Error("access_token is not defined");
      }
    })();
  }, []);

  return (
    <div>
      <LoadingButton
        loading={loading}
        loadingPosition="start"
        startIcon={<ArrowForwardIcon />}
        disabled={!getTopicsFinished}
        variant="outlined"
        onClick={() => {
          setLoading(true);
          if (!endpoint || !azureApiKey) {
            setSummary("endpoint or azureApiKey is not defined");
            throw new Error("endpoint or azureApiKey is not defined");
          } else {
            summary({ endpoint, azureApiKey, messages }).then((res) => {
              setLoading(false);
              setSummary(res);
            });
          }
        }}
      >
        {!getTopicsFinished
          ? "正在获取帖子内容"
          : loading
            ? "正在获取"
            : "获取评价"}
      </LoadingButton>
    </div>
  );
};

const UnLogin = ({ auth }: { auth: AuthContextProps }) => {
  return (
    <div>
      <div className="text-xl font-bold">
        hi,请先登录
        <Button
          onClick={() => {
            auth.signinRedirect();
          }}
        >
          跳转到 CC98 登录中心授权
        </Button>
      </div>
    </div>
  );
};

export default function Home() {
  return (
    <AuthProvider
      {...OIDC_CONFIG}
      onSigninCallback={(user) => {
        console.log(user);
      }}
    >
      <HomeContent />
    </AuthProvider>
  );
}
