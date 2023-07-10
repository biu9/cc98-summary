'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useLayoutEffect,useEffect } from 'react';
import { AuthProvider,useAuth,AuthContextProps } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT,OIDC_CONFIG } from '../../config';
import summary from '@/utils/getSummary';

const endpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;
const azureApiKey = process.env.NEXT_PUBLIC_AZURE_OPENAI_KEY;

const messages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "Does Azure OpenAI support customer managed keys?" },
  { role: "assistant", content: "Yes, customer managed keys are supported by Azure OpenAI" },
  { role: "user", content: "Do other Azure Cognitive Services support this too" },
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

  useLayoutEffect(() => {
    (async() => {
      const res = await fetch(`${API_ROOT}/me/recent-topic?from=0&size=20`,{
        method: 'GET',
        headers:{
          Authorization: `Bearer ${auth.user?.access_token}`,
        }
      })
      const data = await res.json();
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

  console.log('topicContent', topicContent)

  return (
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
        summary({ endpoint,azureApiKey,messages })        
      }
    }}
    >
      {
        loading ? '正在获取' : '获取评价'
      }
    </LoadingButton>
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