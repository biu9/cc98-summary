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
  E: "Extraversion", I: "Introversion",
  S: "Sensing", N: "Intuition",
  T: "Thinking", F: "Feeling",
  J: "Judging", P: "Perceiving"
};

const MotionBox = motion(Box as any); // FIXME: 类型断言

export function MBTIResultCard({ results = defaultResults, userName = 'Your' }: { results?: IMBTIResponse, userName?: string }) {
  const actualType = results.first.type + results.second.type + results.third.type + results.fourth.type;
  const dimensions = [
    { title: "Energy", letter: results.first.type, description: results.first.explanation },
    { title: "Information", letter: results.second.type, description: results.second.explanation },
    { title: "Decisions", letter: results.third.type, description: results.third.explanation },
    { title: "Lifestyle", letter: results.fourth.type, description: results.fourth.explanation },
  ];

  return (
    <Card sx={{ maxWidth: 800, margin: 'auto', overflow: 'hidden' }}>
      <CardHeader
        title={`${userName}的MBTI Profile`}
        sx={{
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          textAlign: 'center'
        }}
      />
      <CardContent>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" component="h2" gutterBottom>
            {userName}的类型: <Box component="span" sx={{ color: 'primary.main' }}>{actualType}</Box>
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {actualType.split('').map(letter => typeDescriptions[letter]).join(' • ')}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {dimensions.map((dim, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  borderRadius: 1 
                }}
              >
                <Chip
                  label={dim.letter}
                  sx={{
                    bgcolor: typeColors[dim.letter] || 'grey.500',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    mb: 1
                  }}
                />
                <Typography variant="h6" component="h3" gutterBottom>
                  {dim.title}
                </Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary">
                  {dim.description}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          sx={{ 
            p: 2, 
            bgcolor: 'grey.100', 
            borderRadius: 1 
          }}
        >
          <Typography variant="h6" component="h3" gutterBottom textAlign="center">
            Potential Alternative Type: 
            <Box component="span" sx={{ ml: 1, color: 'primary.main' }}>
              {results.potential.type}
            </Box>
          </Typography>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            {results.potential.explanation}
          </Typography>
        </MotionBox>
      </CardContent>
    </Card>
  );
}