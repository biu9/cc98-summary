import './globals.css'
import { Inter, Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

const poppins = Poppins({ 
  weight: ['200', '300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'CC98 Agent',
  description: 'CC98 Agent - 提供MBTI测试、文档总结等功能',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={poppins.className}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
