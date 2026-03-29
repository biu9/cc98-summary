"use client";

import type { OidcMetadata, UserManagerSettings } from "oidc-client-ts";
import { WebStorageStateStore } from "oidc-client-ts";

const OPENID_ROOT = "https://openid.cc98.org";

/**
 * 必须使用完整 metadata 并覆盖 token_endpoint。
 * 仅用 metadataSeed 会被 discovery 合并时覆盖（remote 在后），导致仍直连 CC98 换 token → invalid_client。
 */
function buildCc98Metadata(origin: string): Partial<OidcMetadata> {
  return {
    issuer: OPENID_ROOT,
    authorization_endpoint: `${OPENID_ROOT}/connect/authorize`,
    token_endpoint: `${origin}/api/auth/cc98-token`,
    userinfo_endpoint: `${OPENID_ROOT}/connect/userinfo`,
    jwks_uri: `${OPENID_ROOT}/.well-known/openid-configuration/jwks`,
    end_session_endpoint: `${OPENID_ROOT}/connect/endsession`,
  };
}

/**
 * 与 griseous 一致：redirect_uri 使用当前页面 origin，并在 localStorage 中保存 OIDC 状态。
 * 必须在浏览器中调用。
 */
export function createBrowserOidcSettings(): UserManagerSettings {
  const origin = window.location.origin;
  const root = `${origin}/`;
  return {
    client_id: "acce963f-2ee5-4e94-a9c2-08db7f014b10",
    response_type: "code",
    scope: "openid cc98-api offline_access",
    authority: OPENID_ROOT,
    metadata: buildCc98Metadata(origin),
    redirect_uri: root,
    silent_redirect_uri: root,
    userStore: new WebStorageStateStore({ store: window.localStorage }),
    monitorSession: false,
    automaticSilentRenew: true,
    validateSubOnSilentRenew: true,
    includeIdTokenInSilentRenew: false,
    loadUserInfo: false,
  };
}
