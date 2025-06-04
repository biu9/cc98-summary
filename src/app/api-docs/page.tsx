'use client'

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// 动态导入SwaggerUI，避免服务器端渲染问题
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => <div className="flex justify-center items-center h-96">加载Swagger UI中...</div>
});

export default function ApiDocsPage() {
  const [spec, setSpec] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('/api/swagger')
      .then(response => response.json())
      .then(data => setSpec(data))
      .catch(error => console.error('Error loading API spec:', error));
  }, []);

  if (!mounted) {
    return <div className="flex justify-center items-center h-screen">初始化中...</div>;
  }

  if (!spec) {
    return <div className="flex justify-center items-center h-screen">加载API文档中...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          CC98 Summary API 文档
        </h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <SwaggerUI spec={spec} />
        </div>
      </div>
    </div>
  );
} 