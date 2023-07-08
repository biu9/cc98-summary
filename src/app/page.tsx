'use client';
import LoadingButton from '@mui/lab/LoadingButton';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useState,useEffect } from 'react';
import { AuthProvider,useAuth } from "react-oidc-context";
import { Button } from '@mui/material';
import { API_ROOT } from '../../config';
import { UserManagerSettings, WebStorageStateStore } from "oidc-client";

const CURRENT_ROOT = 'http://192.168.1.5:1234';
const OPENID_ROOT = "https://openid.cc98.org";

const OIDC_CONFIG: UserManagerSettings = {
  client_id: "acce963f-2ee5-4e94-a9c2-08db7f014b10",
  response_type: "code",
  scope: "openid cc98-api offline_access",
  authority: OPENID_ROOT,
  redirect_uri: `${CURRENT_ROOT}/`,
  silent_redirect_uri: `${CURRENT_ROOT}/`,
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  monitorSession: false,
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
  includeIdTokenInSilentRenew: false,
  loadUserInfo: false,
};


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
      <div className='font-mono flex justify-center items-center flex-col min-h-screen space-y-5 '>
        <div className='text-7xl mb-20'>CC98 summary</div>
        <LoginComponent />
        <div className='text-gray-400'>
          点击下方按钮获取你的个人评价
        </div>
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
      </div>
    </AuthProvider>
  )
}
