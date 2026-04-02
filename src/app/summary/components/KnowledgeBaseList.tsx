"use client";

import { useState } from "react";
import { CircularProgress } from "@mui/material";
import { ArticleRounded, CheckCircleRounded, FolderRounded, RefreshRounded } from "@mui/icons-material";
import Link from "next/link";
import { useAuth } from "react-oidc-context";
import { useSummaryStore } from "@/store/summaryStore";
import { IKnowledgeBase } from "../types";

export function KnowledgeBaseList() {
  const auth = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    knowledgeBases,
    selectedKnowledgeBase,
    selectKnowledgeBase,
    loadKnowledgeBases,
    setFeedback,
  } = useSummaryStore();

  const handleSelectKnowledgeBase = (knowledgeBase: IKnowledgeBase) => {
    selectKnowledgeBase(knowledgeBase);
  };

  const handleRefreshKnowledgeBases = async () => {
    if (!auth.user?.access_token) {
      setFeedback("未找到访问令牌，请重新登录。");
      return;
    }

    setIsRefreshing(true);
    try {
      await loadKnowledgeBases(auth.user.access_token);
      setFeedback("知识库已重新加载。");
    } catch (error) {
      console.error("刷新知识库失败:", error);
      setFeedback("重新加载知识库失败，请稍后再试。");
    } finally {
      setIsRefreshing(false);
    }
  };

  if (knowledgeBases.length === 0) {
    return (
      <div className="flex min-h-[360px] items-center justify-center px-5 py-8">
        <div className="w-full rounded-[12px] border border-black/5 bg-black/[0.02] px-5 py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[10px] bg-[#111111] text-white">
            <FolderRounded />
          </div>
          <h3 className="mt-5 text-xl font-semibold text-slate-900">暂时没有知识库</h3>
          <p className="mt-3 text-sm text-slate-600">
            可以先刷新，或者去收藏页看分组是否正常。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleRefreshKnowledgeBases}
              disabled={isRefreshing}
              className="button-secondary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? (
                <>
                  <CircularProgress size={16} />
                  刷新中
                </>
              ) : (
                <>
                  <RefreshRounded className="text-[1rem]" />
                  重新获取
                </>
              )}
            </button>
            <Link href="/favorites" className="button-secondary">
              打开收藏整理
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">收藏分组</h3>
          <p className="mt-1 text-sm text-slate-600">点击即可切换问答上下文。</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/favorites" className="pill text-xs">
            整理收藏
          </Link>
          <button
            type="button"
            onClick={handleRefreshKnowledgeBases}
            disabled={isRefreshing}
            className="pill text-xs disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isRefreshing ? (
              <>
                <CircularProgress size={14} />
                刷新中
              </>
            ) : (
              <>
                <RefreshRounded className="text-[1rem]" />
                刷新
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 custom-scrollbar">
        {knowledgeBases.map((knowledgeBase) => {
          const selected = selectedKnowledgeBase?.id === knowledgeBase.id;

          return (
            <button
              key={knowledgeBase.id}
              type="button"
              onClick={() => handleSelectKnowledgeBase(knowledgeBase)}
              className={`w-full rounded-[12px] border px-5 py-5 text-left transition ${
                selected
                  ? "border-black/15 bg-black/[0.03] shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
                  : "border-black/5 bg-white hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-11 w-11 items-center justify-center rounded-[10px] ${
                      selected ? "bg-[#111111] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <FolderRounded className="text-[1.15rem]" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="line-clamp-2 text-base font-semibold text-slate-900">
                      {knowledgeBase.name}
                    </h4>
                    <p className="mt-2 text-sm text-slate-600">
                      {knowledgeBase.topics.length} 个帖子
                    </p>
                  </div>
                </div>
                {selected && (
                  <CheckCircleRounded className="mt-1 text-[#111111]" />
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="pill text-xs">
                  <ArticleRounded className="text-[1rem]" />
                  已就绪
                </div>
                <div className="mono text-xs text-slate-500">
                  {new Date(knowledgeBase.updatedAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

