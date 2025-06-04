import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CC98 Summary API',
      version: '1.0.0',
      description: 'CC98论坛内容总结和MBTI分析API',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://cc98agent.top' 
          : 'http://localhost:1234',
        description: process.env.NODE_ENV === 'production' ? '生产环境' : '开发环境',
      },
    ],
    components: {
      schemas: {
        IGeneralResponse: {
          type: 'object',
          properties: {
            isOk: {
              type: 'boolean',
              description: '请求是否成功'
            },
            data: {
              type: 'object',
              description: '返回的数据'
            },
            msg: {
              type: 'string',
              description: '返回消息'
            }
          },
          required: ['isOk', 'data', 'msg']
        },
        ISummaryRequest: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '需要总结的文本内容'
            }
          },
          required: ['text']
        },
        IMBTIRequest: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: '用户发帖内容文本'
            },
            username: {
              type: 'string',
              description: '用户名'
            }
          },
          required: ['text', 'username']
        },
        IMBTIResponse: {
          type: 'object',
          properties: {
            first: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['E', 'I'],
                  description: 'MBTI第一个维度：外向(E)或内向(I)'
                },
                explanation: {
                  type: 'string',
                  description: '第一个维度的解释'
                }
              }
            },
            second: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['S', 'N'],
                  description: 'MBTI第二个维度：感觉(S)或直觉(N)'
                },
                explanation: {
                  type: 'string',
                  description: '第二个维度的解释'
                }
              }
            },
            third: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['T', 'F'],
                  description: 'MBTI第三个维度：思考(T)或感觉(F)'
                },
                explanation: {
                  type: 'string',
                  description: '第三个维度的解释'
                }
              }
            },
            fourth: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['J', 'P'],
                  description: 'MBTI第四个维度：判断(J)或感知(P)'
                },
                explanation: {
                  type: 'string',
                  description: '第四个维度的解释'
                }
              }
            },
            potential: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  description: '潜在的MBTI类型'
                },
                explanation: {
                  type: 'string',
                  description: '潜在类型的详细解释'
                }
              }
            }
          }
        },
        ChatMessage: {
          type: 'object',
          properties: {
            role: {
              type: 'string',
              enum: ['user', 'assistant', 'system'],
              description: '消息角色'
            },
            content: {
              type: 'string',
              description: '消息内容'
            }
          },
          required: ['role', 'content']
        }
      }
    }
  },
  apis: [
    './src/app/api/**/*.ts',
    './src/app/api/summary/route.ts',
    './src/app/api/mbti/route.ts', 
    './src/app/api/llm/chat/route.ts',
    process.cwd() + '/src/app/api/**/*.ts'
  ], // 多种路径格式确保扫描到
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec; 