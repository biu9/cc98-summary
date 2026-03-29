"use client";

const API_ROOT = "https://api.cc98.org";

const TOPIC_PER_REQUEST = 20; // 一次请求的主题数量

const MAX_TOPIC_COUNT = 100; // 最多请求的主题数量

export const MAX_CALL_PER_USER = 5; // 每个用户最多请求的摘要数量

const MAX_CONCURRENCY = 5; // 并发请求数量

export { API_ROOT, TOPIC_PER_REQUEST, MAX_TOPIC_COUNT, MAX_CONCURRENCY };
