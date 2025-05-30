import type { NextApiRequest, NextApiResponse } from 'next';

const WEBVPN_API_BASE = 'https://api-cc98-org-s.webvpn.zju.edu.cn:8001';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const testResults = {
    timestamp: new Date().toISOString(),
    webvpnUrl: WEBVPN_API_BASE,
    tests: [] as any[]
  };

  // 测试1: 基本连接测试
  try {
    console.log('[Test 1] Testing basic connection...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    const response = await fetch(`${WEBVPN_API_BASE}/me`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'User-Agent': 'CC98-Test/1.0'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    testResults.tests.push({
      name: 'Basic Connection',
      status: 'success',
      httpStatus: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });
    
  } catch (error: any) {
    testResults.tests.push({
      name: 'Basic Connection',
      status: 'failed',
      error: error.message,
      errorType: error.name,
      details: error.toString()
    });
  }

  // 测试2: DNS解析测试
  try {
    console.log('[Test 2] Testing DNS resolution...');
    const dns = require('dns').promises;
    const addresses = await dns.lookup('api-cc98-org-s.webvpn.zju.edu.cn');
    
    testResults.tests.push({
      name: 'DNS Resolution',
      status: 'success',
      address: addresses.address,
      family: addresses.family
    });
    
  } catch (error: any) {
    testResults.tests.push({
      name: 'DNS Resolution',
      status: 'failed',
      error: error.message
    });
  }

  // 测试3: 端口连接测试
  try {
    console.log('[Test 3] Testing port connectivity...');
    const net = require('net');
    
    const portTest = await new Promise((resolve, reject) => {
      const socket = new net.Socket();
      socket.setTimeout(5000);
      
      socket.on('connect', () => {
        socket.destroy();
        resolve({ connected: true });
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      });
      
      socket.on('error', (err: Error) => {
        socket.destroy();
        reject(err);
      });
      
      socket.connect(8001, 'api-cc98-org-s.webvpn.zju.edu.cn');
    });
    
    testResults.tests.push({
      name: 'Port Connectivity',
      status: 'success',
      port: 8001,
      result: portTest
    });
    
  } catch (error: any) {
    testResults.tests.push({
      name: 'Port Connectivity',
      status: 'failed',
      error: error.message,
      port: 8001
    });
  }

  // 测试4: 原始CC98 API测试
  try {
    console.log('[Test 4] Testing original CC98 API...');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://api.cc98.org/me', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    testResults.tests.push({
      name: 'Original CC98 API',
      status: 'success',
      httpStatus: response.status,
      statusText: response.statusText
    });
    
  } catch (error: any) {
    testResults.tests.push({
      name: 'Original CC98 API',
      status: 'failed',
      error: error.message,
      note: 'This is expected when not on campus network'
    });
  }

  return res.status(200).json(testResults);
} 