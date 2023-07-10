'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useLayoutEffect,useEffect } from 'react';
import { AuthProvider,useAuth,AuthContextProps } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT,OIDC_CONFIG } from '../../config';
import summary from '@/utils/getSummary';
import { getMarkdownContent } from '@/utils/getMarkdonwContent';

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
  const [topicContent, setTopicContent] = useState<string[]>([]);
  const [summaryContent, setSummaryContent] = useState<string>('');

  useLayoutEffect(() => {
    (async() => {
      const res1 = await fetch(`${API_ROOT}/me/recent-topic?from=0&size=20`,{
        method: 'GET',
        headers:{
          Authorization: `Bearer ${auth.user?.access_token}`,
        }
      })
      const res2 = await fetch(`${API_ROOT}/me/recent-topic?from=20&size=20`,{
        method: 'GET',
        headers:{
          Authorization: `Bearer ${auth.user?.access_token}`,
        }
      })
      const data1 = await res1.json();
      const data2 = await res2.json();
      const data = [...data1,...data2];
      const tmpTopicContent = data.map(async (item:any) => {
        const topicContent = await fetch(`${API_ROOT}/topic/${item.id}/post?from=0&size=1`,{
          method: 'GET',
          headers:{ 
            Authorization: `Bearer ${auth.user?.access_token}`,
          }
        });
        const topicContentData = await topicContent.json();
        return topicContentData[0];
      })
      const topicContent = await Promise.all(tmpTopicContent);
      setTopicContent(topicContent);
    })()
  },[])

  topicContent.forEach((item:any) => {
    messages[1].content += getMarkdownContent(item.title+item.content);
  })

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