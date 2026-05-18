---
title: 2026武汉icpc邀请赛题解
published: 2026-05-18
pinned: true
description: 2026武汉icpc邀请赛题解
tags: [icpc, 武汉大学]
category: icpc
draft: false
image: https://img.542000.xyz/file/默认封面/1779093840973_武汉icpc1.png
---

## 2026武汉icpc邀请赛题解

    持续更新中💫

### A 期望排序

### B 序列操作

### C 相信着你

### D 质数博弈

​	先手策略是将 $n$ 变成一个 $n$ 到 $(2n-1)$  之间的一个数，该数最优的情况只包含 $2$ 和 $3$ 作为因数，后手策略每次选择该数最大的因数作除法，这样可以使 $n$ 的减小速度最快。

​	**记忆化搜索**

```c++
// D 质数博弈
#include<bits/stdc++.h>
using namespace std;
#define int long long

#define gc getchar
#define pc putchar
inline int read(){//手动读取数字更加快速
    int sum=0,d=1;
    char c=gc();
    while(c<'0'||c>'9'){
        if(c=='-')d=-1;
        c=gc();
    }
    while(c>='0'&&c<='9'){
        sum=sum*10+c-'0';
        c=gc();
    }
    return sum*d;
}
inline void print(int x){
	if(x<0) pc('-'),x=-x;
	if(x<10) pc(x+'0');
	else print(x/10),pc(x%10+'0');
}

const int N=2e3+9; // 所有2和3作为因数的数不超过2000个(1179)
const int inf=2e18; // n==1e18时先手可变为2e18-1

int a[N],idx=1;
map<int,int> mp;
void init(){
	a[0]=1;
	for(int i=1;;i++){
		int tmp=a[i-1]<<1;
		if(tmp>inf || tmp<0) break;//越界
		a[i]=tmp;
		idx++;
	}
	for(int i=0;i<62;i++){
		int tmp=a[i];
		while(tmp*3<inf){
			tmp*=3;
			a[idx++]=tmp;
		}
	}
	sort(a,a+idx);
	// for(int i=0;i<idx;i++) printf("%lld:%lld\n",i,a[i]);
	mp[0]=0;
	mp[1]=0;
	mp[2]=1;
	mp[3]=2;
	mp[4]=2;
}

int dfs(int n){
	if(mp.count(n)) return mp[n];
	int ans=0;
	int p=lower_bound(a,a+idx,n)-a; // 先手可选择的数为n<=a[p+j]<2*n
	// printf("%lld:%lld:%lld\n",n,p,a[p]);
	int j=0;
	while(a[p+j]<2*n){ // 后手为最优策略为有3取3,没3取2
		// printf("%lld:%lld\n",n,a[p+j]);
		if(a[p+j]%3==0) ans=max(ans,dfs(a[p+j]/3)+1);
		else ans=max(ans,dfs(a[p+j]/2)+1);
		j++;
	}
	// printf("%lld:%lld\n",n,ans);
	return mp[n]=ans;
}

signed main(){
	// cin.tie(nullptr)->sync_with_stdio(false);
	init();
	int n=read();
	print(dfs(n));
	puts("");
	// int tmp=inf/2;
	// for(int i=tmp;i<=tmp;i++){
		// print(dfs(i));
		// puts("");
	// }
	return 0;
}
```

### E 棋盘

### F 抽奖

### G 我会/一直/记得你

### H 矩形切割

### I 奶龙大战暴暴龙2

### J 最厉害的卡牌

### K 删除游戏

### L字符串匹配

### M 彩叶和构造王国

