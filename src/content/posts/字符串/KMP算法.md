---
title: KMP算法
published: 2026-06-07
pinned: false
description: KMP算法
tags: [字符串]
category: 字符串
draft: false
image: https://img.542000.xyz/file/默认封面/1780812525642_QQ图片20260607140822_76_.jpeg
---

## KMP算法

给定一个模式串P，一个文本串S，求P在S中出现的所有位置。

1. 取**最长的**相等前后缀，可以保证不漏解。
2. 通过模式串前后缀的**自我匹配**的长度，计算**next函数**，给$j$指针打一张表，失配时就跳到$next[j]$的位置继续匹配。

### $next$函数

$next[i]$表示在模式串$P[1,i]$中**相等前后缀**的**最长**长度。

$O(n)$

```c++
ne[1]=0;
for(int i=2,j=0;i<=n;i++){
    while(j && p[i]^p[j+1]) j=ne[j];
    if(p[i]==p[j+1]) j++;
    ne[i]=j;
}
```

### 模式串与主串匹配

$O(m)$

```c++
for(int i=1j=0;i<=m;i++){
    while(j&&s[i]^p[j+1]) j=ne[j];
    if(s[i]==p[j+1]) j++;
    if(j==n) printf("%d\n",i-n+1);//输出匹配位置
}
```

