import React from 'react'
import { Card, CardContent, CardHeader, Typography, Grid, Chip, Box } from '@mui/material'
import { motion } from 'framer-motion'
import { IMBTIResponse } from '@request/api'

const defaultResults: IMBTIResponse = {
  first: { type: "E", explanation: "Extraverted: You gain energy from social interactions and external stimuli." },
  second: { type: "N", explanation: "Intuitive: You focus on the big picture, patterns, and future possibilities." },
  third: { type: "T", explanation: "Thinking: You make decisions based on logic, consistency, and objective analysis." },
  fourth: { type: "J", explanation: "Judging: You prefer structure, planning, and organization in your daily life." },
  potential: { 
    type: "INFP", 
    explanation: "The Mediator: Idealistic, creative, and empathetic individuals who are driven by their values and seek harmony."
  }
};

const typeColors: { [key: string]: string } = {
  E: "#2196F3", I: "#3F51B5",
  S: "#4CAF50", N: "#009688",
  T: "#FF9800", F: "#E91E63",
  J: "#9C27B0", P: "#F44336"
};

const typeDescriptions: { [key: string]: string } = {
  E: "外向", I: "内向",
  S: "实感", N: "直觉",
  T: "思考", F: "情感",
  J: "判断", P: "认知"
};

const MotionBox = motion(Box as any);

export function MBTIResultCard({ results = defaultResults, userName = 'Your' }: { results?: IMBTIResponse, userName?: string }) {
  const actualType = results.first.type + results.second.type + results.third.type + results.fourth.type;
  const dimensions = [
    { title: "能量来源", letter: results.first.type, description: results.first.explanation },
    { title: "信息获取", letter: results.second.type, description: results.second.explanation },
    { title: "决策方式", letter: results.third.type, description: results.third.explanation },
    { title: "生活态度", letter: results.fourth.type, description: results.fourth.explanation },
  ];

  return (
    <div className="elegant-card overflow-hidden">
      <div className="p-6 text-center border-b border-gray-100">
        <h2 className="text-2xl font-light">{userName}的MBTI分析结果</h2>
      </div>
      
      <div className="p-6">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-light mb-2">
            您的类型: <span className="font-medium">{actualType}</span>
          </h3>
          <p className="text-gray-500">
            {actualType.split('').map(letter => typeDescriptions[letter]).join(' • ')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {dimensions.map((dim, index) => (
            <MotionBox
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="elegant-card p-4 flex flex-col items-center"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl mb-3"
                style={{ backgroundColor: typeColors[dim.letter] || '#666' }}
              >
                {dim.letter}
              </div>
              <h4 className="text-lg font-medium mb-2">{dim.title}</h4>
              <p className="text-gray-500 text-center text-sm">
                {dim.description}
              </p>
            </MotionBox>
          ))}
        </div>
        
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="elegant-card p-4"
        >
          <h4 className="text-lg font-medium mb-2 text-center">
            潜在替代类型: <span className="text-blue-600 ml-1">{results.potential.type}</span>
          </h4>
          <p className="text-gray-500 text-center text-sm">
            {results.potential.explanation}
          </p>
        </MotionBox>
      </div>
    </div>
  );
}