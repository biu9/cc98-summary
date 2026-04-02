import { motion } from "framer-motion";
import { IMBTIResponse } from "@request/api";

const defaultResults: IMBTIResponse = {
  first: {
    type: "E",
    explanation:
      "Extraverted: You gain energy from social interactions and external stimuli.",
  },
  second: {
    type: "N",
    explanation:
      "Intuitive: You focus on the big picture, patterns, and future possibilities.",
  },
  third: {
    type: "T",
    explanation:
      "Thinking: You make decisions based on logic, consistency, and objective analysis.",
  },
  fourth: {
    type: "J",
    explanation:
      "Judging: You prefer structure, planning, and organization in your daily life.",
  },
  potential: {
    type: "INFP",
    explanation:
      "The Mediator: Idealistic, creative, and empathetic individuals who are driven by their values and seek harmony.",
  },
};

const typeColors: Record<string, string> = {
  E: "#111111",
  I: "#27272a",
  S: "#3f3f46",
  N: "#52525b",
  T: "#71717a",
  F: "#404040",
  J: "#18181b",
  P: "#4b5563",
};

const typeDescriptions: Record<string, string> = {
  E: "外向",
  I: "内向",
  S: "实感",
  N: "直觉",
  T: "思考",
  F: "情感",
  J: "判断",
  P: "认知",
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.08, duration: 0.28 },
  }),
};

export function MBTIResultCard({
  results = defaultResults,
  userName = "你",
}: {
  results?: IMBTIResponse;
  userName?: string;
}) {
  const actualType =
    results.first.type +
    results.second.type +
    results.third.type +
    results.fourth.type;

  const dimensions = [
    {
      title: "能量来源",
      letter: results.first.type,
      description: results.first.explanation,
    },
    {
      title: "信息获取",
      letter: results.second.type,
      description: results.second.explanation,
    },
    {
      title: "决策方式",
      letter: results.third.type,
      description: results.third.explanation,
    },
    {
      title: "生活态度",
      letter: results.fourth.type,
      description: results.fourth.explanation,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="border-b border-black/5 bg-black/[0.03] px-6 py-6 md:px-8">
        <p className="kicker">MBTI Result</p>
        <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">
          {userName}的 MBTI 分析结果
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          这是根据论坛行为生成的一份人格侧写，适合作为表达倾向和讨论风格的快速概览。
        </p>
      </div>

      <div className="px-6 py-8 md:px-8">
        <div className="rounded-[12px] bg-[#111111] px-6 py-6 text-white shadow-[0_28px_80px_rgba(15,23,42,0.16)]">
          <p className="mono text-xs uppercase tracking-[0.2em] text-slate-400">
            Final Type
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div className="text-5xl font-semibold tracking-[0.18em] md:text-6xl">
              {actualType}
            </div>
            <div className="rounded-[8px] border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
              {actualType
                .split("")
                .map((letter) => typeDescriptions[letter])
                .join(" / ")}
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            潜在替代类型：
            <span className="ml-2 font-semibold text-white">
              {results.potential.type}
            </span>
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {dimensions.map((dimension, index) => (
            <motion.div
              key={`${dimension.title}-${dimension.letter}`}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="rounded-[12px] border border-black/8 bg-black/[0.02] px-5 py-5"
            >
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-[10px] text-2xl font-semibold text-white shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
                  style={{ backgroundColor: typeColors[dimension.letter] ?? "#64748b" }}
                >
                  {dimension.letter}
                </div>
                <div>
                  <p className="mono text-xs uppercase tracking-[0.18em] text-slate-500">
                    Dimension
                  </p>
                  <h3 className="mt-1 text-xl font-semibold text-slate-900">
                    {dimension.title}
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600">
                {dimension.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="mt-6 rounded-[12px] border border-black/10 bg-black/[0.03] px-5 py-5"
        >
          <p className="mono text-xs uppercase tracking-[0.18em] text-slate-500">
            Alternate Pattern
          </p>
          <h3 className="mt-3 text-2xl font-semibold text-slate-900">
            {results.potential.type}
          </h3>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {results.potential.explanation}
          </p>
        </motion.div>
      </div>
    </div>
  );
}

