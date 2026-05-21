---
title: ST表-RMQ问题
published: 2026-05-22
pinned: false
description: 
tags: [算法, 数据结构，倍增]
category: 数据结构
draft: false
image: https://img.542000.xyz/file/默认封面/1779382134656_preview.jpg
---

## RMQ问题

Range Minimum/Maximum Query

描述：RMQ问题是指在给定的数组中，查询任意两个索引之间的最小/大值。

RMQ问题不止ST表一种解法，还有其他解法，比如线段树、树状数组等。

在**不对原数组进行修改**的情况下，ST表是最优解，查询复杂度仅 $O(1)$。
线段树和树状数组的查询复杂度为 $O(\log n)$。

## ST表

Sparse Table，稀疏表

ST表是一种**倍增**算法。预处理时间复杂度为 $O(nlogn)$，查询时间复杂度为 $O(1)$。

### 核心转移方程：

$$
f\left[ i \right] \left[ j \right] =\max \left( f\left[ i \right] \left[ j-1 \right] ,f\left[ i+\left( 1<<\left( j-1 \right) \right) \right] \left[ j-1 \right] \right)
$$

含义：

以`i`为起点，长度为 $2^j$ 的最大数。`j=0`时，值为`a[i]`。

以下是RMQ问题的ST表解法：

``` c++
const int N=1e5+9;
const int len=20;

int f[N][len];
//预处理
void st(int a[],int n){
    for(int i=1;i<=n;i++) f[i][0]=a[i];
    for(int j=1;j<len;j++)
        for(int i=1;i+(i<<j)-1<=n;i++)
            f[i][j]=max(f[i][j-1],f[i+(1<<(j-1))][j-1]);
}

//查询
int query(int l,int r){
    int s=r-l+1;
    //clz函数用于找二进制数s的前导0数量
    //可得s的二进制位数，若为ll，31改为63，clz改为clzll
    int k=31-__buitin_clz(s);
    
    return max(f[l][k],f[r-(1<<k)+1][k]);
}
```

此外，ST表还常用于**最近公共祖先(LCA)**的求解中。