import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  ExpandMore,
  ExpandLess,
} from '@mui/icons-material';

interface TestResult {
  name: string;
  status: 'success' | 'failed';
  error?: string;
  note?: string;
  [key: string]: any;
}

interface DiagnosticResults {
  timestamp: string;
  webvpnUrl: string;
  tests: TestResult[];
}

const WebVPNStatus: React.FC = () => {
  const [results, setResults] = useState<DiagnosticResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-webvpn');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Failed to run diagnostics:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle color="success" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <Warning color="warning" />;
    }
  };

  const getOverallStatus = () => {
    if (!results) return 'unknown';
    
    const basicConnection = results.tests.find(t => t.name === 'Basic Connection');
    const dnsResolution = results.tests.find(t => t.name === 'DNS Resolution');
    const portConnectivity = results.tests.find(t => t.name === 'Port Connectivity');
    
    if (basicConnection?.status === 'success') {
      return 'good';
    } else if (dnsResolution?.status === 'success' && portConnectivity?.status === 'success') {
      return 'need-login';
    } else {
      return 'bad';
    }
  };

  const getStatusMessage = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'good':
        return { 
          severity: 'success' as const, 
          message: 'WebVPN连接正常，API应该可以正常工作。' 
        };
      case 'need-login':
        return { 
          severity: 'warning' as const, 
          message: 'WebVPN服务可达，但需要登录验证。请先登录WebVPN后再使用API。' 
        };
      case 'bad':
        return { 
          severity: 'error' as const, 
          message: 'WebVPN服务不可用。请检查网络连接或联系管理员。' 
        };
      default:
        return { 
          severity: 'info' as const, 
          message: '正在检测WebVPN连接状态...' 
        };
    }
  };

  const getSuggestions = () => {
    const status = getOverallStatus();
    switch (status) {
      case 'need-login':
        return [
          '在浏览器中访问 https://webvpn.zju.edu.cn/portal',
          '使用您的浙大账号登录WebVPN',
          '登录成功后刷新此页面',
          '确保在使用API时包含有效的授权令牌'
        ];
      case 'bad':
        return [
          '检查网络连接',
          '确认您有权访问浙大WebVPN',
          '联系网络管理员确认WebVPN服务状态'
        ];
      default:
        return [];
    }
  };

  const statusMessage = getStatusMessage();
  const suggestions = getSuggestions();

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">WebVPN连接状态</Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={runDiagnostics}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
          >
            重新检测
          </Button>
        </Box>

        <Alert severity={statusMessage.severity} sx={{ mb: 2 }}>
          {statusMessage.message}
        </Alert>

        {results && (
          <>
            <Box display="flex" alignItems="center" mb={1}>
              <Typography variant="body2" color="textSecondary">
                检测时间: {new Date(results.timestamp).toLocaleString()}
              </Typography>
            </Box>

            <Box display="flex" gap={1} mb={2}>
              {results.tests.map((test, index) => (
                <Chip
                  key={index}
                  label={test.name}
                  color={test.status === 'success' ? 'success' : 'error'}
                  size="small"
                  icon={getStatusIcon(test.status)}
                />
              ))}
            </Box>

            {suggestions.length > 0 && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold" mb={1}>
                  建议操作:
                </Typography>
                <List dense>
                  {suggestions.map((suggestion, index) => (
                    <ListItem key={index} sx={{ py: 0 }}>
                      <ListItemText 
                        primary={`${index + 1}. ${suggestion}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Alert>
            )}

            <Button
              variant="text"
              size="small"
              onClick={() => setExpanded(!expanded)}
              endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            >
              {expanded ? '隐藏' : '显示'}详细信息
            </Button>

            <Collapse in={expanded}>
              <List dense>
                {results.tests.map((test, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      {getStatusIcon(test.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={test.name}
                      secondary={
                        test.status === 'failed' 
                          ? `错误: ${test.error}${test.note ? ` (${test.note})` : ''}`
                          : '正常'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WebVPNStatus; 