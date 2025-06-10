import { IKnowledgeBase, IReferenceProps } from '@/app/summary/types';

const KNOWLEDGE_BASES_KEY = 'cc98_knowledge_bases';

export class KnowledgeBaseManager {
  // 获取所有知识库
  static getAll(): IKnowledgeBase[] {
    try {
      const data = localStorage.getItem(KNOWLEDGE_BASES_KEY);
      if (!data) return [];
      
      const knowledgeBases = JSON.parse(data);
      // 将日期字符串转换回Date对象
      return knowledgeBases.map((kb: any) => ({
        ...kb,
        createdAt: new Date(kb.createdAt),
        updatedAt: new Date(kb.updatedAt)
      }));
    } catch (error) {
      console.error('获取知识库失败:', error);
      return [];
    }
  }

  // 保存知识库
  static save(knowledgeBase: IKnowledgeBase): boolean {
    try {
      const knowledgeBases = this.getAll();
      const existingIndex = knowledgeBases.findIndex(kb => kb.id === knowledgeBase.id);
      
      if (existingIndex >= 0) {
        knowledgeBases[existingIndex] = { ...knowledgeBase, updatedAt: new Date() };
      } else {
        knowledgeBases.push(knowledgeBase);
      }
      
      localStorage.setItem(KNOWLEDGE_BASES_KEY, JSON.stringify(knowledgeBases));
      return true;
    } catch (error) {
      console.error('保存知识库失败:', error);
      return false;
    }
  }

  // 删除知识库
  static delete(id: string): boolean {
    try {
      const knowledgeBases = this.getAll();
      const filteredKBs = knowledgeBases.filter(kb => kb.id !== id);
      localStorage.setItem(KNOWLEDGE_BASES_KEY, JSON.stringify(filteredKBs));
      return true;
    } catch (error) {
      console.error('删除知识库失败:', error);
      return false;
    }
  }

  // 创建新知识库
  static create(name: string, description: string, topics: IReferenceProps[]): IKnowledgeBase {
    const now = new Date();
    return {
      id: `kb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      topics,
      createdAt: now,
      updatedAt: now
    };
  }

  // 更新知识库的帖子
  static updateTopics(id: string, topics: IReferenceProps[]): boolean {
    try {
      const knowledgeBases = this.getAll();
      const kb = knowledgeBases.find(kb => kb.id === id);
      
      if (!kb) return false;
      
      kb.topics = topics;
      kb.updatedAt = new Date();
      
      return this.save(kb);
    } catch (error) {
      console.error('更新知识库帖子失败:', error);
      return false;
    }
  }

  // 检查知识库名称是否已存在
  static isNameExists(name: string, excludeId?: string): boolean {
    const knowledgeBases = this.getAll();
    return knowledgeBases.some(kb => kb.name === name && kb.id !== excludeId);
  }
} 