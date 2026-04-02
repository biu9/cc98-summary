import "./globals.css";
import { IBM_Plex_Mono, Noto_Sans_SC } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { AppThemeProvider } from "@/components/AppThemeProvider";
import { OidcAuthProvider } from "@/components/OidcAuthProvider";

const notoSansSc = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export const metadata = {
  title: "CC98 Agent",
  description: "CC98 Agent - 提供 MBTI 分析、帖子问答与 API 文档等能力。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      className={`${notoSansSc.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <AppThemeProvider>
          <OidcAuthProvider>{children}</OidcAuthProvider>
        </AppThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
