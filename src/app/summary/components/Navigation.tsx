"use client"
import Link from "next/link";

const Navigation: React.FC = () => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors">
            CC98 Hub
          </Link>
          <div className="flex space-x-3">
            <Link href="/mbti" className="text-sm px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
              MBTI测试
            </Link>
            <Link href="/summary" className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700">
              智能问答
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 