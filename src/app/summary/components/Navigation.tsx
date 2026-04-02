"use client"
import Link from "next/link";

const Navigation: React.FC = () => {
  return (
    <div className="bg-white shadow-sm border-b mx-4">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-medium text-gray-800 transition-colors hover:text-black">
            CC98 Hub
          </Link>
          <div className="flex items-center space-x-3">
            <Link href="/mbti" className="text-sm px-3 py-1 rounded-[8px] bg-gray-100 transition-colors hover:bg-gray-200">
              MBTI测试
            </Link>
            <Link href="/summary" className="text-sm px-3 py-1 rounded-[8px] bg-black text-white">
              智能问答
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigation; 
