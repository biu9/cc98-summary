'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useLayoutEffect,useEffect } from 'react';
import { AuthProvider,useAuth,AuthContextProps } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT,OIDC_CONFIG } from '../../config';
import summary from '@/utils/getSummary';
import { getMarkdownContent } from '@/utils/getMarkdonwContent';
import getTopicContent from '@/utils/getAllTopic';

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

let messages = [
  { role: "system", content: "现在你是一个专业的心理医生,请根据以下文字为咨询者做一个人格类型总结,要求总结给出你的论据:" },
  { role: "user", content: "" },
];

const HomeContent = () => {

  const auth = useAuth();

  return (
    <div className='font-mono flex justify-center items-center flex-col min-h-screen space-y-5 '>
      <div className='text-7xl mb-20'>CC98 summary</div>
      {
        auth.isAuthenticated ? <GetSummary auth={auth} /> : <UnLogin auth={auth} />
      }
    </div>
  )
}

const GetSummary = ({ auth }:{ auth:AuthContextProps }) => {

  const [loading, setLoading] = useState(false);
  const [summaryContent, setSummaryContent] = useState<string>('');

  useLayoutEffect(() => {
    (async() => {
      if(auth.user?.access_token) {
        const topicContent = await getTopicContent(auth.user?.access_token);
        messages[1].content = topicContent        
      } else {
        throw new Error('access_token is not defined')
      }
    })()
  },[])

  return (
    <div>
      <LoadingButton
      loading={loading}
      loadingPosition="start"
      startIcon={<ArrowForwardIcon />}
      variant="outlined"
      onClick={() => {
        setLoading(true);
        if(!endpoint || !azureApiKey) {
          throw new Error('endpoint or azureApiKey is not defined')
        } else {
          summary({ endpoint,azureApiKey,messages }).then(res => {
            setSummaryContent(res);
            setLoading(false);
          })    
        }
      }}
      >
        {
          loading ? '正在获取' : '获取评价'
        }
      </LoadingButton>
      {
        summaryContent
      }
    </div>
  )
}

const UnLogin = ({ auth }:{ auth:AuthContextProps }) => {
  return (
    <div>
      <div className='text-xl font-bold'>
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
  )
}

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
  )
}