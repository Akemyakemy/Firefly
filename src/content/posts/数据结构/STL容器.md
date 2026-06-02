---
title: STL容器
published: 2026-06-01
pinned: false
description: 各种存储容器的增删改查
tags: [数据结构, STL]
category: 数据结构
draft: false
image: https://img.542000.xyz/file/默认封面/1780290653354_preview.jpg
---

## STL容器

直接展示图表吧。

| 名称               | 容器             | 头文件            | 创建                           | 添加操作                                    | 删除操作                                | 访问操作                           |
| ------------------ | ---------------- | ----------------- | ------------------------------ | ------------------------------------------- | --------------------------------------- | ---------------------------------- |
| 变长数组           | `vector`         | `<vector>`        | `vector<int> v`                | `v.push_back(x)` O(1)                       | `v.pop_back()` O(1)                     | `v[i]` O(1)                        |
| 双端队列           | `deque`          | `<deque>`         | `deque<int> d`                 | `d.push_front(x)` O(1)`d.push_back(x)` O(1) | `d.pop_front()` O(1)`d.pop_back()` O(1) | `d.front()` O(1)`d.back()` O(1)    |
| 栈                 | `stack`          | `<stack>`         | `stack<int> s`                 | `s.push(x)` O(1)                            | `s.pop()` O(1)                          | `s.top()` O(1)                     |
| 队列               | `queue`          | `<queue>`         | `queue<int> q`                 | `q.push(x)` O(1)                            | `q.pop()` O(1)                          | `q.front()` O(1)                   |
| 优先队列（大根堆） | `priority_queue` | `<queue>`         | `priority_queue<int> q`        | `q.push(x)` O(logn)                         | `q.pop()` O(logn)                       | `q.top()` O(1)                     |
| 有序集合           | `set`            | `<set>`           | `set<int> s`                   | `s.insert(x)` O(logn)                       | `s.erase(it)` O(logn)                   | `s.count(x)` O(k+logn)             |
| 无序集合           | `unordered_set`  | `<unordered_set>` | `unordered_set<int> s`         | `s.insert(x)` O(1)/O(n)                     | `s.erase(it)` O(1)/O(n)                 | `s.count(x)` O(1)/O(n)             |
| 有序键值对映射     | `map`            | `<map>`           | `map<string, int> h`           | `h[str]=x` O(logn)                          | `h.erase(it)` O(logn)                   | `h.count(str)`; `h[str]` O(logn)   |
| 无序键值对映射     | `unordered_map`  | `<unordered_map>` | `unordered_map<string, int> h` | `h[str]=x` O(1)/O(n)                        | `h.erase(it)` O(1)/O(n)                 | `h.count(str)`; `h[str]` O(1)/O(n) |

