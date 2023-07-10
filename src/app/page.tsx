'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useLayoutEffect,useEffect } from 'react';
import { AuthProvider,useAuth,AuthContextProps } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT,OIDC_CONFIG } from '../../config';
import { WebStorageStateStore,UserManagerSettings } from "oidc-client-ts";

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

  const [dynamicConfig, setDynamicConfig] = useState<UserManagerSettings>({
    ...OIDC_CONFIG
  })

  useEffect(() => {
    const CURRENT_ROOT = window.location.origin; 
    const userStore = new WebStorageStateStore({ store: window.localStorage });
    setDynamicConfig({
      ...dynamicConfig,
      userStore,
      redirect_uri: `${CURRENT_ROOT}/`,
      silent_redirect_uri: `${CURRENT_ROOT}/`,
    })
  },[])
  console.log('dynamicConfig', dynamicConfig)
  return (
    <AuthProvider
      {...dynamicConfig}
      onSigninCallback={(user) => {
        console.log(user);
      }}
    >
      <HomeContent />
    </AuthProvider>
  )
}
