'use client'
import React from "react";
import { UserManagerSettings } from "oidc-client-ts";

const API_ROOT = "https://api.cc98.org";

const OPENID_ROOT = "https://openid.cc98.org";

const CURRENT_ROOT = "http://192.168.1.5:1234"

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
}