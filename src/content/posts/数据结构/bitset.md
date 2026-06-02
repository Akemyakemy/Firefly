---
title: bitset
published: 2026-06-01
pinned: false
description: 二进制存储的专署容器
tags: [数据结构, 二进制]
category: 数据结构
draft: false
image: https://img.542000.xyz/file/默认封面/1780291171922_preview.jpg
---

## bitset

| 函数              | 功能                                                | 示例（以 bs2=00001010 为例）   |
| ----------------- | --------------------------------------------------- | ------------------------------ |
| **基础访问**      |                                                     |                                |
| `size()`          | 返回总位数（定义时的长度）                          | `bs2.size()` → 8               |
| `operator[](pos)` | 访问第 pos 位（pos 从 0 开始，0 是最低位）          | `bs2[1]` → 1（第 1 位是 1）    |
| `test(pos)`       | 检查第 pos 位是否为 1（比 [] 更安全，越界会抛异常） | `bs2.test(3)` → 1              |
| **位状态统计**    |                                                     |                                |
| `count()`         | 统计二进制中 1 的个数                               | `bs2.count()` → 2              |
| `all()`           | 判断是否所有位都是 1                                | `bs2.all()` → false            |
| `any()`           | 判断是否至少有一位是 1                              | `bs2.any()` → true             |
| `none()`          | 判断是否所有位都是 0                                | `bs2.none()` → false           |
| **位查找**        |                                                     |                                |
| `_Find_first()`   | 查找第一个值为 1 的位的下标（从 0 开始）            | `bs2._Find_first()` → 1        |
| `_Find_next(pos)` | 查找 pos 之后第一个值为 1 的位的下标                | `bs2._Find_next(1)` → 3        |
| `count_zero()`    | 统计二进制中 0 的个数（C++20 新增）                 | `bs2.count_zero()` → 6         |
| **位修改**        |                                                     |                                |
| `set()`           | 所有位设为 1                                        | `bs2.set()` → 11111111         |
| `set(pos)`        | 将第 pos 位设为 1                                   | `bs2.set(2)` → 00001110        |
| `reset()`         | 所有位设为 0                                        | `bs2.reset()` → 00000000       |
| `reset(pos)`      | 将第 pos 位设为 0                                   | `bs2.reset(1)` → 00001000      |
| `flip()`          | 所有位取反（0→1，1→0）                              | `bs2.flip()` → 11110101        |
| `flip(pos)`       | 将第 pos 位取反                                     | `bs2.flip(3)` → 00000010       |
| **类型转换**      |                                                     |                                |
| `to_ulong()`      | 转换为 unsigned long 类型                           | `bs2.to_ulong()` → 10          |
| `to_ullong()`     | 转换为 unsigned long long 类型                      | `bs2.to_ullong()` → 10         |
| `to_string()`     | 转换为二进制字符串（高位在前）                      | `bs2.to_string()` → "00001010" |

```c++
// 定义：bitset<长度> 变量名(初始值);
bitset<8> bs1;          // 8位，默认全0 → 00000000
bitset<8> bs2(10);      // 8位，初始值为十进制10 → 二进制00001010
bitset<8> bs3("1010");  // 8位，初始值为二进制字符串 → 00001010（高位补0）
bitset<8> bs4(0b1010);  // 8位，初始值为二进制字面量 → 00001010（C++14+）
```

`bs[0]` 是二进制的**最低位**（最右边），`bs[size()-1]` 是最高位（最左边），与直观的字符串顺序相反。

