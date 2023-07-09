'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useLayoutEffect } from 'react';
import { AuthProvider,useAuth,AuthContextProps } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT,OIDC_CONFIG } from '../../config';

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

const LoginComponent = () => {

  const auth = useAuth();
  console.log('auth', auth)
  
  useEffect(() => {
    fetch(`${API_ROOT}/me`, {
      method: 'GET',
      headers:{ Authorization: `Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjAzQTg0MkUwMjlENkE2MzQzNUVFNzNDODk5MDI4MkNGMzk5Mzc4QjBSUzI1NiIsInR5cCI6ImF0K2p3dCIsIng1dCI6IkE2aEM0Q25XcGpRMTduUEltUUtDenptVGVMQSJ9.eyJuYmYiOjE2ODg4Mjg1NDIsImV4cCI6MTY4ODgzMjE0MiwiaXNzIjoiaHR0cHM6Ly9vcGVuaWQuY2M5OC5vcmciLCJhdWQiOiJjYzk4LWFwaSIsImNsaWVudF9pZCI6ImFjY2U5NjNmLTJlZTUtNGU5NC1hOWMyLTA4ZGI3ZjAxNGIxMCIsInN1YiI6IjY0MjIwOCIsImF1dGhfdGltZSI6MTY4ODgyNzcyNiwiaWRwIjoibG9jYWwiLCJ1bmlxdWVfbmFtZSI6Iuayiem7mGlscyIsIm5hbWUiOiLmsonpu5hpbHMiLCJmb3J1bS5wcml2aWxlZ2UiOjQsImp0aSI6IjUxQzFFNzZGNzNGQ0JFMkE0MDhDRjcwNDJFOTE2MkM1Iiwic2lkIjoiMjZBQzU4MjI0MEFBRDIwNTQ3RUE4NUM1MzlFRDk3QTUiLCJpYXQiOjE2ODg4Mjg1NDIsInNjb3BlIjpbIm9wZW5pZCIsImNjOTgtYXBpIiwib2ZmbGluZV9hY2Nlc3MiXSwiYW1yIjpbImlkc3J2Il19.T2fYCYTPzzWNKkr1LNN1-owBzGo_JRDd9aJrv-0CG9Sph6qbiW5R1tmHQUUD5zhkm99DwOf1__DLtFHayqec3aRHf02zq7Xjhip6ClAfeOKVdtgo3JA9jbYX3JFr2l9_4nsNyw9Sr2kRpjJWanpuJk5oLTcdbkZVbaj6ckTYr8FBh9kTQTbWw6cWZvQT4INOnQnBWiCKacVO2iWEFMIBmcRHFoeWISefvC99J2JSrMPTQOBeHsxpG3iqFM5hyAlkVvSJzUz7BG-shzykvfW8Zw4A3-rbuTeevmxOazWU8tu6aLxPUqnnNzg7ApOVYHzCuiqcRuM0FfvQBMra2w3vhA` },
    }).then(res => {
      res.json()
    }).then(res => {
      console.log('my info',res);
    })
  },[])
  

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
      <div>
        <Button
          onClick={() => {
            auth.signoutPopup();
          }}
        >
          退出登录
        </Button>
      </div>
    </div>
  )
}

export default function Home() {

  const [loading, setLoading] = useState(false);

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
