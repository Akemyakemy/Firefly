---
title: TimerManager
published: 2026-09-14
pinned: false
description: 定时器管理器实现
tags: [线程安全,定时器]
category: 计算机系统实战
draft: false
image: ../images/firefly2.avif
---

# 结论先说

✅ **TimerManager（定时器管理器）同样是计算机系统实战、网络编程里非常经典的内容**。
操作系统、服务器后端大量用到定时器：定时任务、心跳、超时关闭连接。
核心思路：**最小堆 + 一条后台线程 + 条件变量`wait_for`**，是工业界单线程定时器最经典实现方案。

> 
> 先修正代码里的编译错误（原代码笔误）
> 
> 
> 1. `datch()` → `detach()`
> 2. `mxt` → `mtx`（mutex拼写错误）
> 3. 头文件缺少 `<thread>`, `<queue>`, `<vector>`, `<cstdio>`

## 完整可编译代码

```
#include <functional>
#include <chrono>
#include <thread>
#include <mutex>
#include <condition_variable>
#include <queue>
#include <vector>
#include <cstdio>

class TimerManager {
public:
    using Callback = std::function<void()>;
    TimerManager();
    ~TimerManager();
    void addTimer(size_t timeoutMs, Callback cb);
private:
    struct TimerTask{
        std::chrono::steady_clock::time_point expire_time;
        Callback callback;
        bool operator > (const TimerTask& other) const {
            return expire_time > other.expire_time;
        }
    };
    void run_loop();
    // 小顶堆：堆顶永远是【最近要到期】的定时器任务
    std::priority_queue<TimerTask,std::vector<TimerTask>,std::greater<TimerTask>> min_heap;
    std::mutex mtx;
    std::condition_variable cv;
    std::atomic<bool> running;
};

TimerManager::TimerManager():running(true){
    // 开启后台线程跑定时器循环，detach分离线程（不join）
    std::thread(&TimerManager::run_loop,this).detach();
}

TimerManager::~TimerManager(){
    running = false;
    cv.notify_one(); // 唤醒等待中的后台线程，让它退出
}

void TimerManager::addTimer(size_t timeoutMs, Callback cb){
    std::lock_guard<std::mutex> lock(mtx);
    // 当前时刻 + 延迟时间 = 到期的时间点
    auto expire = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeoutMs);
    min_heap.push({expire, std::move(cb)});
    cv.notify_one(); // 唤醒后台线程，堆里来了新任务，需要重新判断等待时间
}

void TimerManager::run_loop(){
    while(running){
        std::unique_lock<std::mutex> lock(mtx);
        // 堆为空：没有定时器任务，无限等待，直到addTimer添加任务或者析构唤醒
        if(min_heap.empty()){
            cv.wait(lock);
            continue;
        }
        // 取出堆顶：最近要到期的任务
        auto& top_task = min_heap.top();
        auto now = std::chrono::steady_clock::now();
        auto wait_time = top_task.expire_time - now;
        // wait_for：等待一段时间。两种情况被唤醒：
        // 1. 时间到了 → 返回timeout；2. 被notify唤醒（新增定时器）→ 返回no_timeout
        bool timeout = cv.wait_for(lock, wait_time) == std::cv_status::timeout;
        if(!timeout) continue; // 不是超时唤醒，说明来了新定时器，回到循环重新看堆顶

        // 时间到，取出任务，弹出堆
        auto task = top_task;
        min_heap.pop();
        lock.unlock(); // 提前释放锁！！重点，回调执行的时候不持有锁
        task.callback();
    }
}

int main() {
    TimerManager tm;
    tm.addTimer(1000, [] { printf("1s timer!\n"); });
    tm.addTimer(500, [] { printf("0.5s timer!\n"); });
    std::this_thread::sleep_for(std::chrono::seconds(2));
    return 0;
}
```

# 一、整体逻辑一句话

1. 外部调用`addTimer(毫秒,回调函数)`注册定时器；
2. 所有定时器任务放进**最小堆（小顶堆）**，堆顶永远存放**最早到期**的任务；
3. 后台一条线程`run_loop`：
   - 堆空：休眠等待；
   - 堆不为空：算出距离堆顶任务到期还有多久，调用`cv.wait_for`等待；
   - 如果等待**时间耗尽（timeout）**：说明堆顶定时器到期，弹出任务，执行回调；
   - 如果等待中途被notify唤醒（新增定时器）：重新循环，重新拿堆顶，重新计算等待时间。

> 
> 为什么要用堆？
> 每次新增定时器，要快速找到**最近到期**的任务。堆的插入O(logN)，取最小元素O(1)，弹出最小O(logN)，非常适合定时器场景。

# 二、逐部分拆解知识点（延续前面SyncQueue、Watchdog的知识）

## 1. TimerTask 结构体

```
struct TimerTask{
    std::chrono::steady_clock::time_point expire_time; // 到期的时间点
    Callback callback; // 到期执行的回调函数
    bool operator > (const TimerTask& other) const {
        return expire_time>other.expire_time;
    }
};
```

`operator>` 重载：给`std::greater`用，用来构建**小顶堆**。
`std::priority_queue`默认是大顶堆；加上`std::greater`之后变成**小顶堆**：**expire_time越小（越早到期），排在堆顶**。

## 2. 成员变量

```
std::priority_queue<TimerTask,std::vector<TimerTask>,std::greater<TimerTask>> min_heap;
std::mutex mtx;
std::condition_variable cv;
std::atomic<bool> running;
```

- `min_heap`：存放所有定时任务，共享资源，**多线程读写必须上锁**
- `mtx`：保护堆的互斥锁
- `cv`：条件变量，和SyncQueue里一样，用来休眠/唤醒后台线程，这里用`wait_for`（带超时等待，新API）
- `running`：原子bool，标记线程是否继续运行，析构置false退出循环

## 3. addTimer：外部添加定时器

```
void TimerManager::addTimer(size_t timeoutMs, Callback cb){
    std::lock_guard<std::mutex> lock(mtx);
    auto expire = std::chrono::steady_clock::now() + std::chrono::milliseconds(timeoutMs);
    min_heap.push({expire, std::move(cb)});
    cv.notify_one();
}
```

1. 上锁，保护堆；
2. 计算到期时刻：当前时间 + 用户给的延时毫秒；
3. 把任务压入小顶堆；
4. `notify_one`唤醒后台线程：**新任务来了，可能新任务比之前堆顶更早到期，需要重新计算等待时间**。

## 4. run_loop 后台主循环（核心！）

```
void TimerManager::run_loop(){
    while(running){
        std::unique_lock<std::mutex> lock(mtx);
        if(min_heap.empty()){
            cv.wait(lock);
            continue;
        }
        auto& top_task = min_heap.top();
        auto now = std::chrono::steady_clock::now();
        auto wait_time = top_task.expire_time - now;
        bool timeout = cv.wait_for(lock, wait_time) == std::cv_status::timeout;
        if(!timeout) continue;

        auto task = top_task;
        min_heap.pop();
        lock.unlock();
        task.callback();
    }
}
```

`cv.wait_for(lock, 时长)`：

- 会**释放锁**，线程休眠，等待指定时间；
- 两种唤醒情况：
  1. 等待时间耗尽 → 返回`cv_status::timeout` → 定时器到期，执行回调
  2. 中途收到`notify_one`（addTimer新增任务）→ 返回`cv_status::no_timeout`，不执行回调，回到循环重新读取堆顶

> 
> ⚠️ 重点优化：`lock.unlock()`之后再执行`task.callback()`
> 回调函数执行**不带锁**！避免回调里面又调用addTimer造成死锁。这个是写Watchdog时我们提到的坑，这里这个版本做对了。

## 5. 构造&析构

```
TimerManager::TimerManager():running(true){
    std::thread(&TimerManager::run_loop,this).detach();
}
TimerManager::~TimerManager(){
    running = false;
    cv.notify_one();
}
```

`detach()`：分离线程。线程脱离主线程独立跑，主线程不需要`join()`等待它结束。

> 
> ⚠️ 这里有一个**严重隐患**！
> `detach`的风险：对象析构的时候，后台线程可能还在访问`TimerManager`成员变量，如果对象内存已经销毁，会出现野指针、崩溃。
> 对比前面Watchdog/SyncQueue用`join`，更加安全。
> 改进方案：不要detach，保存thread对象，析构join等待线程退出。

# 三、运行现象

main里注册两个定时器：

- 500ms：0.5s打印 `0.5s timer!`
- 1000ms：1s打印 `1s timer!`
主线程sleep2秒，程序退出。

# 四、这个代码存在的缺陷（面试高频考点）

1. **没有取消定时器接口**
一旦addTimer加入堆，不能删除。很多场景需要取消未到期定时器（网络库常用）。
2. 使用`detach()`不安全
对象销毁时，后台线程可能还在访问对象成员，UB未定义行为。推荐保存thread，析构join。
3. 回调不能再次修改堆的时候还好，如果回调里面执行耗时操作，会阻塞整个定时器线程！> 
> 重点：**所有定时器回调是串行在同一个后台线程执行**。一个回调如果sleep很久，后面所有定时器全部推迟触发。
> 解决办法：回调里的长任务丢进前面的SyncQueue，交给线程池执行。
4. 不支持循环定时器，只支持一次性定时器（addTimer是单次触发）

# 五、计算机系统实战对应知识点

1. **最小堆（优先队列）**：数据结构，快速取最近到期任务
2. 条件变量 `wait_for`：带超时的等待，是定时器核心原语
3. 临界区 + mutex：保护共享堆
4. 后台守护线程
5. 事件驱动，定时事件回调
6. 时间管理：steady_clock单调时钟
7. 多线程同步：notify唤醒等待线程

# 六、三连对比：SyncQueue / Watchdog / TimerManager（重点总结）

| 模块 | 核心数据结构 | 线程数量 | 核心API | 用途 | 核心同步原语 |
| --- | --- | --- | --- | --- | --- |
| SyncQueue | std::queue | 生产者N + 消费者N | push/pop | 线程之间传递任务，生产者消费者模型 | mutex + condition_variable wait() |
| Watchdog | unordered_map | 1条监控线程 | feed() | 多模块超时监控，看门狗巡检 | mutex + atomic，轮询sleep |
| TimerManager | 小顶堆priority_queue | 1条定时器线程 | addTimer() | 注册定时任务，到期执行回调 | mutex + condition_variable wait_for() |

> 
> 这三个代码就是计算机系统实战多线程模块三件套，经常连续作为作业。
> 一般工程组合：TimerManager产生定时事件 → 丢入SyncQueue → 线程池消费；Watchdog监控各个业务模块是否卡死。