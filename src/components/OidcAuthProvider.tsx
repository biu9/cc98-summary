"use client";

import { type ReactNode, useEffect, useState } from "react";
import { AuthProvider } from "react-oidc-context";
import type { UserManagerSettings } from "oidc-client-ts";
import { createBrowserOidcSettings } from "@/lib/oidcSettings";

export function OidcAuthProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserManagerSettings | null>(null);

  useEffect(() => {
    setSettings(createBrowserOidcSettings());
  }, []);

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <p className="text-gray-600">正在初始化登录状态…</p>
      </div>
    );
  }

  return (
    <AuthProvider
      {...settings}
      onSigninCallback={() => {
        window.history.replaceState({}, document.title, window.location.pathname);
      }}
    >
      {children}
    </AuthProvider>
  );
}
