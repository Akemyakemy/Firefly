---
title: DP入门
published: 2026-06-13
pinned: false
description: DP入门
tags: [动态规划]
category: 动态规划
draft: false
image: https://img.542000.xyz/file/默认封面/1781150352316_QQ图片20260611115808_157_.jpeg
---

## DP入门

动态规划是一种通过把原问题分解为相对简单的子问题的方式求解复杂问题的方法．

由于动态规划并不是某种具体的算法，而是一种解决特定问题的方法，因此**它会出现在各式各样的数据结构中**，与之相关的题目种类也更为繁杂．

### 最长公共子序列

求两个序列的最长公共子序列(LCS)的长度。

```c++
int n,m,a[N],b[M],f[N][M];

int dp(){
    for(int i=1;i<=n;i++){
        for(int j=1;j<=m;j++){
            if(a[i]==b[j]) f[i][j]=f[i-1][j-1]+1;
            else f[i][j]=max(f[i-1][j],f[i][j-1]);
        }
    }
    return f[n][m];
}
```

### 最长不下降子序列

求一个序列的最长不下降子序列(LIS)的长度。

#### 朴素算法

$O(n^2)$

```c++
int n,a[N],f[N];

int dp(){
    f[1]=1;
    int ans=1;
    for(int i=2;i<=n;i++){
        f[i]=1;
        for(int j=1;j<i;j++){
            if(a[i]>=a[j]) f[i]=max(f[i],f[j]+1);
        }
        ans=max(ans,f[i]);
    }
    return ans;
}
```

#### [二分查找](https://blog.542000.xyz/posts/%E5%9F%BA%E7%A1%80%E7%AE%97%E6%B3%95/%E4%BA%8C%E5%88%86%E6%9F%A5%E6%89%BE/)

$O(nlogn)$

```c++
int a[N];      // 原序列，下标从1开始
int b[N];      // b[len] 表示长度为 len 的上升子序列的末尾最小值（贪心）
int len = 1;   // 当前找到的最长上升子序列的长度，初始为1
b[1] = a[1];   // 第一个元素自己构成长度为1的上升子序列

int dp() {
    for (int i = 2; i <= n; i++) {          // 从第二个元素开始扫描
        if (a[i] > b[len]) {                // 情况1：当前元素比已知最长子序列的末尾还大
            b[++len] = a[i];                // 直接延长，最长长度+1
        } else {                             // 情况2：当前元素不能延长最长序列
            // 在 b[1..len] 中找第一个 >= a[i] 的位置
            int j = lower_bound(b + 1, b + len + 1, a[i]) - b;
            b[j] = a[i];                    // 用 a[i] 替换掉那个位置的元素，使 b[j] 变小
            // 这样不会增加长度，但能维护 b 数组的“末尾最小”性质，为后续延长做准备
        }
    }
    return len;      // 最终长度就是最长上升子序列的长度
}
```

#### [线段树](https://blog.542000.xyz/posts/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/%E7%BA%BF%E6%AE%B5%E6%A0%91/)优化

$O(nlogn) $

```c++
#define lc p<<1
#define rc p<<1|1

int n,a[N],mx,dp[N];
struct tn{
    int l,r,ma;//ma表示该范围内的某个数作为序列的最后一个值时，最长不下降子序列的长度
}tr[N<<2];

void build(int p,int l,int r){
    tr[p]={l,r,0};
    if(l==r) return;
    int mid=l+r>>1;
    build(lc,l,mid);
    build(rc,mid+1,r);
}

void update(int p,int i,int k){
    if(tr[p].l==tr[p].r) tr[p].ma=k,return;
    int mid=(tr[p].l+tr[p].r)>>1;
    if(i<=mid) update(lc,i,k);
    else update(rc,i,k);
    tr[p].ma=max(tr[lc].ma,tr[rc].ma);
}

void query(int p,int l,int r){
    if(l<=tr[p].l && tr[p].r<=r) return tr[p].ma;
    int mid=(tr[p].l+tr[p].r)>>1;
    int ans=0;
    if(l<=mid) ans=max(ans,query(lc,l,r));
    if(r>mid) ans=max(ans,query(rc,l,r));
    return ans;
}

signed main(){
    cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i],mx=max(mx,a[i]);//利用最大的权值作为线段树的范围，这样的线段树又叫权值线段树
    build(1,1,mx);
    int ans=0;
    for(int i=1;i<=n;i++){
        int pre=query(1,1,a[i]);
        dp[i]=pre+1;
        update(1,a[i],dp[i]);
        ans=max(ans,dp[i]);
    }
    cout<<ans<<endl;
    return 0;
}
```

#### [树状数组](https://blog.542000.xyz/posts/%E6%95%B0%E6%8D%AE%E7%BB%93%E6%9E%84/%E6%A0%91%E7%8A%B6%E6%95%B0%E7%BB%84/)优化

$O(nlogn) $

```c++
#define lb(x) x&(-x)

int n,a[N],dp[N],tr[N],mx;//tr[N]表示树状数组，mx表示最大的权值，dp[N]表示每个位置的最长不下降子序列的长度

void change(int x,int k){//向后修改，与线段树相同，此处下标是权值
    while(x<=mx) tr[x]=max(tr[x],k),x+=lb(x);
}

void query(int x){//向前查询
    int s=0;
    while(x) s=max(s,tr[x]),x-=lb(x);
    return s;
}

signed main(){
    cin>>n;
    for(int i=1;i<=n;i++) cin>>a[i],mx=max(mx,a[i]);//利用最大的权值作为树状数组的范围，这样的树状数组又叫权值树状数组
    int ans=0;
    for(int i=1;i<=n;i++){
        int pre=query(a[i]);
        dp[i]=pre+1;
        change(a[i],dp[i]);
        ans=max(ans,dp[i]);
    }
    cout<<ans<<endl;
    return 0;
}
```