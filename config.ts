'use client'
import { UserManagerSettings } from "oidc-client-ts";

const API_ROOT = "https://api.cc98.org";

const OPENID_ROOT = "https://openid.cc98.org";

const CURRENT_ROOT = "http://192.168.1.5:1234";

const TOPIC_PER_REQUEST = 20; // 一次请求的主题数量

const MAX_TOPIC_COUNT = 100; // 最多请求的主题数量 

const MAX_CONCURRENCY = 5; // 并发请求数量

const PROMPT = "现在你是一个专业的心理医生,你的咨询者是一位大学生,请根据这位大学生在校园论坛上发的一系列帖子总结他的人格类型,你将获得由多个帖子组成的字符串,每个帖子由“时间，主题，内容”组成,并以“||”结尾,请给出你的总结,并附带上相应论据:"

const OIDC_CONFIG:UserManagerSettings = {
  client_id: "acce963f-2ee5-4e94-a9c2-08db7f014b10",
  response_type: "code",
  scope: "openid cc98-api offline_access",
  authority: OPENID_ROOT,
  monitorSession: false,
  automaticSilentRenew: true,
  validateSubOnSilentRenew: true,
  includeIdTokenInSilentRenew: false,
  loadUserInfo: false,
  redirect_uri: `${CURRENT_ROOT}/`,
  silent_redirect_uri: `${CURRENT_ROOT}/`,
};
  
export {
    API_ROOT,
    OIDC_CONFIG,
    TOPIC_PER_REQUEST,
    MAX_TOPIC_COUNT,
    PROMPT,
    MAX_CONCURRENCY
}