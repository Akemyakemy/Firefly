---
title: Watchdog
published: 2026-09-14
pinned: false
description: 后巡看门狗实现
tags: [线程安全,看门狗]
category: 计算机系统实战
draft: false
image: ../images/firefly2.avif
---

# 结论先讲

✅ **Watchdog（看门狗）也是计算机系统实战 / 操作系统的经典内容**。
硬件看门狗是单片机/嵌入式里的硬件定时器：程序卡死不喂狗，硬件就自动重启。
你现在这个是**软件看门狗**，用C++多线程实现，作用：

> 
> 多个业务模块，每个模块必须**定期调用 feed() 喂狗**；
> 如果某个模块太久没喂狗（超过timeoutMs），就执行报警回调函数。
> 单独开一条后台监控线程，不停检查所有模块的喂狗时间。

> 
> 先把代码里**编译错误**一次性全部修正（你代码变量名打错，后面解释用修正后的代码）
> 错误汇总：
> 
> 
> 1. `timeout_ms_` / `timeout_ms` 名字不一致
> 2. `alarm_cb_` / `alarm_cb` 名字不一致
> 3. `running_` / `running` 名字不一致
> 4. `mxt` → `mtx`（mutex变量名拼写错）

```
#include <iostream>
#include <functional>
#include <thread>
#include <mutex>
#include <unordered_map>
#include <chrono>
#include <string>

class Watchdog {
public:
    // 回调类型：报警的时候，把超时模块名字传给这个函数
    using Callback = std::function<void(const std::string& module)>;
    // 构造函数：设置超时毫秒数 + 报警回调
    Watchdog(size_t timeoutMs, Callback cb);
    // 模块调用这个函数：喂狗，刷新该模块的最后存活时间
    void feed(const std::string& module);
private:
    size_t timeout_ms;
    Callback alarm_cb;
    std::atomic<bool> running;       // 标记监控线程是否继续跑
    std::thread monitor_thread;     // 后台监控线程
    std::mutex mtx;
    // key：模块名，value：这个模块上一次喂狗的时间点
    std::unordered_map<std::string, std::chrono::steady_clock::time_point> last_feed_time;
    void monitor_loop(); // 监控线程执行的循环函数
public:
    ~Watchdog();
};

Watchdog::Watchdog(size_t timeoutMs, Callback cb)
    : timeout_ms(timeoutMs), alarm_cb(std::move(cb)), running(true)
{
    // 创建后台线程，执行monitor_loop函数，this代表当前Watchdog对象
    monitor_thread = std::thread(&Watchdog::monitor_loop, this);
}

Watchdog::~Watchdog() {
    running = false;                 // 通知监控线程退出循环
    if (monitor_thread.joinable()) {
        monitor_thread.join();       // 主线程等待监控线程安全结束
    }
}

void Watchdog::feed(const std::string& module) {
    std::lock_guard<std::mutex> lock(mtx);
    // 更新【该模块】最后一次喂狗的时间 = 当前时刻
    last_feed_time[module] = std::chrono::steady_clock::now();
}

void Watchdog::monitor_loop() {
    // running是原子bool，控制循环
    while (running) {
        // 每100ms扫描一次所有模块（不用一直疯狂循环占用CPU）
        std::this_thread::sleep_for(std::chrono::milliseconds(100));

        std::lock_guard<std::mutex> lock(mtx);
        auto now = std::chrono::steady_clock::now();

        // 遍历所有已经喂过狗的模块
        for (auto& item : last_feed_time) {
            const std::string& module_name = item.first;
            auto& last_ts = item.second;
            // 计算：当前时间 - 上一次喂狗时间，转成毫秒
            auto delta = std::chrono::duration_cast<std::chrono::milliseconds>(now - last_ts).count();

            // 如果间隔 > 设定的超时时间 → 模块超时，触发报警
            if (delta > static_cast<long long>(timeout_ms)) {
                alarm_cb(module_name);
                last_ts = now; // 重置时间，防止反复不停报警（100ms一次疯狂回调）
            }
        }
    }
}
```

# 一、整体逻辑一句话理解

1. 我们创建一个看门狗对象，设置超时时间，并且写一个**报警回调函数**（超时的时候自动跑这个函数，比如打印日志、上报异常）
2. 多个业务模块（模块A、模块B）每隔一段时间调用 `feed("模块名字")` 喂狗
3. Watchdog 自动开启一条**后台监控线程**，每隔100ms扫一遍全部模块：
   - 模块按时喂狗 → 无事发生
   - 超过timeout_ms没有feed → 调用报警回调
4. 销毁Watchdog对象时，后台监控线程安全退出

> 
> 对应操作系统概念：**后台守护线程（daemon thread）**，专门负责巡检、监控。

# 二、逐个拆解新知识点（你线程锁零基础，慢慢看）

## 1. `std::chrono::steady_clock::time_point` 时间点

普通`std::time`会被系统时间修改（手动改电脑时间会出bug）。
`steady_clock`：**单调递增时钟**，只记录时间流逝，不受系统时间修改影响，适合做超时判断。

- `std::chrono::steady_clock::now()` 获取当前的时间点
- `now - last_ts`：得到两个时间点之间的时间差
- `duration_cast<milliseconds>(xxx).count()`：把时间差转成**毫秒数字**

## 2. `std::unordered_map<std::string, time_point> last_feed_time`

记录每个模块的最后喂狗时刻。

- key：字符串模块名，比如`"network"`、`"db"`
- value：这个模块上次调用feed的时间点> 
> 多个线程会读写这个map：
> 业务线程调用`feed()` → **写map**
> 监控线程monitor_loop遍历 → **读map**
> 多线程同时读写同一个容器，会数据错乱崩溃 → 所以需要互斥锁`mtx`保护。

## 3. `std::mutex mtx;` + `std::lock_guard<std::mutex> lock(mtx);`

和前面SyncQueue里锁一模一样！
只要进入大括号，自动上锁；离开大括号，自动解锁。

- `feed()`里面：上锁，修改map里对应模块的时间
- `monitor_loop`循环里：上锁，读取、遍历整个map

> 
> 重点：**只要读写共享的last_feed_time，必须加锁！**
> 不加锁：监控线程正在遍历map的时候，业务线程同时插入/修改map，程序直接崩溃。

## 4. `std::atomic<bool> running;` 原子布尔

用来控制监控线程的while循环。
`atomic`原子变量：多线程读写这个bool**不需要mutex保护**，不会出现数据竞争。

- 主线程析构的时候：`running = false`
- 监控线程while循环读取`running`，看到false就退出循环，线程结束。

> 
> 为什么running要用atomic，不用普通bool？
> 如果是普通bool，编译器会优化，后台线程可能永远看不到running被修改，死循环卡死。

## 5. `std::thread monitor_thread;` 后台监控线程

```
monitor_thread = std::thread(&Watchdog::monitor_loop, this);
```

含义：新开一条线程，执行`this`这个Watchdog实例的`monitor_loop`成员函数。

```
if (monitor_thread.joinable()) {
    monitor_thread.join();
}
```

`join()`：**主线程卡住，等待子监控线程执行完毕，再继续往下走**。
析构函数必须join，不然程序退出时子线程还在跑，程序崩溃。

## 6. `using Callback = std::function<void(const std::string& module)>;`

`std::function` 是C++可调用对象包装器，可以存一个函数。

- 报警的时候，看门狗自动调用这个函数，把超时模块名字传进去
例子，使用的时候写报警回调：

```
// 超时回调：打印哪个模块超时
auto alarmFunc = [](const std::string& mod) {
    std::cout << "模块【" << mod << "】看门狗超时！\n";
};
// 创建看门狗，500ms超时
Watchdog wd(500, alarmFunc);
```

# 三、使用示例，完整main，可以直接跑

```
int main() {
    auto alarmFunc = [](const std::string& mod) {
        std::cout << "【报警】模块 " << mod << " 超时！\n";
    };
    // 看门狗：超时阈值500ms
    Watchdog wd(500, alarmFunc);

    // 模拟模块1：正常持续喂狗，200ms喂一次，永远不会超时
    std::thread mod1([&wd](){
        while(true){
            wd.feed("module1");
            std::this_thread::sleep_for(std::chrono::milliseconds(200));
        }
    });
    // 模拟模块2：只喂几次狗，之后停止feed，很快触发报警
    std::thread mod2([&wd](){
        for(int i=0;i<3;i++){
            wd.feed("module2");
            std::this_thread::sleep_for(std::chrono::milliseconds(300));
        }
        // 循环结束，不再调用feed，module2超时，看门狗会报警
    });

    std::this_thread::sleep_for(std::chrono::seconds(3));
    return 0;
}
```

运行现象：
module1一直喂狗，不会报警；module2停止feed之后，监控线程扫描发现超过500ms没喂狗，打印报警日志。

# 四、这个代码的问题（面试常问，你重点看）

1. **报警后直接更新last_ts=now**
作用：防止每100ms重复触发报警。代价：就算模块恢复喂狗，也要等下一次feed刷新时间。
2. **没有删除模块的接口**
如果某个模块永久下线，它会永远留在`last_feed_time`map里，持续报警。需要增加`unregister`函数，删除map中的模块。
3. 扫描间隔固定写死100ms
超时判断精度最大误差接近100ms；
4. **回调alarm_cb在锁持有期间执行！严重坑！**

```
if (delta > xxx) {
    alarm_cb(module_name);  // <-- 这里还拿着mtx锁！
    last_ts = now;
}
```

❌ 风险：回调函数内部如果又调用feed，会**死锁**。
✅ 修复方案：把回调拿到锁外面执行，先收集超时模块，释放锁，再执行回调。

修正思路示例：

```
void Watchdog::monitor_loop() {
    while (running) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
        std::vector<std::string> timeout_modules;
        {
            std::lock_guard<std::mutex> lock(mtx);
            auto now = std::chrono::steady_clock::now();
            for (auto& item : last_feed_time) {
                auto delta = std::chrono::duration_cast<std::chrono::milliseconds>(now - item.second).count();
                if(delta > static_cast<long long>(timeout_ms)){
                    timeout_modules.push_back(item.first);
                    item.second = now;
                }
            }
        }
        // 锁已经释放！再执行回调
        for(auto &mod : timeout_modules){
            alarm_cb(mod);
        }
    }
}
```

# 五、操作系统 / 计算机系统实战对应知识点

1. **守护线程**：后台持续巡检的线程，不处理业务，专门监控状态；
2. **共享资源 + 互斥锁**：多线程读写共享map，临界区保护；
3. 原子变量：线程间安全的标志位；
4. 时钟与时序、超时检测；
5. 回调机制：事件驱动（发生超时事件，触发回调）；
6. 线程生命周期：创建、join等待线程退出，优雅关闭；
7. 轮询（polling）：每隔固定时间扫描状态，这是最简单的监控方案。

# 六、和上一节 SyncQueue 的关联

两个都是计算机系统实战最经典的多线程工程代码：

- SyncQueue：**生产者消费者，任务队列，线程之间传递数据**
- Watchdog：**后台巡检守护线程，状态监控、超时检测**
两个都会用到 `mutex、lock_guard、std::thread、atomic`，锁的原理完全一致。
