## eventLoop

JavaScript是一种单线程的语言，其原因是多线程会带来++复杂的同步问题++。为了利用多核cpu的能力，html5中允许主线程创建多个子线程，但是++子线程完全受主线程控制且无法操作DOM++。blink的eventloop依赖于libevent库。

#### 任务分类
在单线程中，只有前一个任务执行完成，后一个任务才可以执行。很多时候并不是因为CPU的计算能力问题，而是在于++IO执行慢++。所以需要进行等待。
- 同步任务

     在主线程执行的任务，前一个任务执行完毕后一个任务跟上。
- 异步任务

    不进入主线程，而在任务队列执行的任务。当任务队列提醒主线程，异步任务可以执行时，任务进入主线程执行。
    
- 运行机制
    1. 所有同步任务在主线程上执行，形成++执行栈++
    2. 主线程之外存在++任务队列(task queue)++，当异步任务有了运行结果，在任务队列中放置一个事件
    3. 当执行栈同步任务执行完毕，主线程读取任务队列，对应的异步任务结束等待进入执行栈开始执行。
    4. 重复

#### 任务队列的调度算法
单线程多队列任务调度
- 非抢占式
- 基于权重
- 避免CPU饥饿

根据权重分为以下5个级别的调度队列
1.  Control Priority Task Queue
2.  High Priority Task Queue
3.  Normal Priority Task Queue
4.  Low Priority Task Queue
5.  BestEffort Priority Task Queue


核心代码

```
  while (true) {
       if (Control priority task queue has tasks) {
           Process tasks in Control priority;
           Update starvation score in {High,Normal,Low} task queue
           continue;
       }
       if (Low priority task queue is in starvation) {
           Process one task in Low priority task queue;
           Clear starvation in Low priority queue and update {High, Normal} score;
           continue;
       }
       if (Normal priority task queue is in starvation) {
           Process one task in Normal priority task queue;
           Clear starvation in Low priority queue and update {High, Low} score;
           continue;
        }
       for (From High priority task queue to BestEffort priority task queue) {
           Select one task in task queue if possible and process.
           break; 
       }
}
 
 
```
当高一级的队列抽取任务执行时，提升所有低级任务队列任务权重。

#### 任务队列
任务队列又分为macrotask(task)和microtask(jobs)
- task: script(整体代码), setTimeout, setInterval, setImmediate, I/O, **UI rendering**
- microtask: process.nextTick, **Promise**, Object.observe(已废弃), MutationObserver(html5新特性)

任务队列是++task的有序列表++。每个任务都来自一个特定的++任务源++。所有来自一个特定任务源并且属于特定事件循环的任务通常必须被加入同一个任务列表中。但是来自不同任务源的任务可能会放在不同的任务队列中。

- setTimeout/Promise等我们称之为任务源。而进入任务队列的是他们指定的具体执行任务。 

主线程的读取过程基本是自动的，只要执行栈清空，主线程首先检查任务事件，之后多个任务队列会提供一个事件交给主线程处理。

执行栈中的代码（同步任务），总是在读取"任务队列"（异步任务）之前执行。

#### 事件循环
一个事件循环里有很多个任务队列（task queues）来自不同任务源，每一个任务队列里的任务是严格按照++先进先出++的顺序执行的，但是不同任务队列的任务的**执行顺序是不确定的**。每个事件循环都会有一个进入microtask检查点的Flag标识，他被用来反复组织调用进入microtask检查点的算法。

事件循环的顺序决定js代码执行，从整体代码开始进行循环，直到调用栈清空，运行所有microtask。当所有microtask执行完毕后，循环再次从task开始并一直循环下去。

事件循环的进程顺序如下:
1. 选择当前执行的任务队列并选择最早进入的任务，无任务则跳转到microtask步骤。
2. 事件循环当前任务设置为已选择并执行
3. 当前运行任务设置为null，将运行完成的任务剔除。
4. 进入microtask检查点，执行microtask的运行任务。
5. beforeRender(++raf++)
6. render
7. 返回步骤1

- requestAnimationFrame:在每次render前的时间节点执行，60帧的情况下大概16ms执行一次，**适合于动画的逐帧控制**。

microtask顺序(++如果microtask不为空会一次性清空所有microtask任务++):
1. 设置进入microtask检查点的标志为true。
2. 当事件循环的微任务队列不为空时：选择一个最先进入microtask队列的microtask；设置事件循环的当前运行任务为已选择的microtask；运行microtask；设置事件循环的当前运行任务为null；将运行结束的microtask从microtask队列中移除。
3. 对于相应事件循环的每个环境设置对象（environment settings object）,通知它们哪些promise为rejected。
4. 清理indexedDB的事务。
5. 设置进入microtask检查点的标志为false。

#### 定时器
定时器功能主要由setTimeout()与setInterval()两个函数完成。区别在于一次执行与反复执行。

setTimeout(fn,0)的含义是，指定某个任务在主线程++最早可得的空闲时间++执行，也就是说，尽可能早得执行。++它在"任务队列"的尾部添加一个事件，因此要等到同步任务和"任务队列"现有的事件都处理完，才会得到执行++。

setTimeout()只是将事件插入了"任务队列"，++必须等到当前代码（执行栈）执行完，主线程才会去执行它指定的回调函数++。要是当前代码耗时很长，有可能要等很久，所以并没有办法保证，回调函数一定会在setTimeout()指定的时间执行。



#### nodejs事件循环

nodejs的eventloop依赖于libuv库，包括以下六个阶段

```
   ┌───────────────────────┐
┌─>│        timers         │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     I/O callbacks     │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │     idle, prepare     │
│  └──────────┬────────────┘      ┌───────────────┐
│  ┌──────────┴────────────┐      │   incoming:   │
│  │         poll          │<─────┤  connections, │
│  └──────────┬────────────┘      │   data, etc.  │
│  ┌──────────┴────────────┐      └───────────────┘
│  │        check          │
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
└──┤    close callbacks    │
   └───────────────────────┘

```

- timers: 执行setTimeout和setInterval预定的callback
- I/O: 除了定时器以及close的callback
- idle,prepare: node内部
- poll: 获取新的I/O事件, 适当的条件下node将阻塞在这里
- check: setImmdiate的callback
- close

每一个阶段都有一个装有callbacks的fifo queue，当事件循环运行到一个指定阶段时，
node将执行该阶段的queue，当队列callback执行完或者执行callbacks数量超过该阶段的上限时，
event loop会转入下一下阶段.

timers,I/O callbacks,check: tick/microtask

poll阶段可以分为下面情况
-  poll不为空且未设置timer，执行poll中的callback直到全部执行完或者达到系统上限
-  poll为空未设置timer，setImmediate有待执行的callback，进入check阶段。如果无setImmediate，阻塞。
-  poll为空且设置了timer，检查timers,如果有1个或多个timers时间时间已经到达，将按循环顺序进入timers阶段，并执行timer queue.

**process.nextTick()**: 不在任何一个阶段执行，而只在阶段切换之间执行。 

#### 例子
**exp.1**

```
//本次事件循环
console.log('script start');

//进入下一个事件循环
setTimeout(function() {
  console.log('setTimeout');
}, 0);

//进入microtask
Promise.resolve().then(function() {
  console.log('promise1');
}).then(function() {
  console.log('promise2');
});

//本次事件循环
console.log('script end');

/*
script start
script end
promise1
promise2
setTimeout
*/
```

**exp.2 node.js**

```
setTimeout(() => { 
    console.log(1);
    new Promise(resolve => { 
        resolve();
    }).then(() => { 
        console.log(2);
    }); 
}, 0);
setTimeout(() => { 
    console.log(3);
    new Promise(resolve => { 
        resolve();
    }).then(() => { 
        console.log(4);
    }); 
}, 0);
```
输出为1，3，2，4(node一次执行完队列的所有事件，所以task中的1，3先执行，microtask中的2，4后执行)

**exp.3 chrome/blink**

```
setTimeout(() => { 
    console.log(1);
    new Promise(resolve => { 
        resolve();
    }).then(() => { 
        console.log(2);
    }); 
}, 0);
setTimeout(() => { 
    console.log(3);
    new Promise(resolve => { 
        resolve();
    }).then(() => { 
        console.log(4);
    }); 
}, 0);
```
输出为1，2，3，4(chrome选择一个task调度执行，先执行第一个setTimeout中的task与microtask)

#### 参考
- http://www.ruanyifeng.com/blog/2014/10/event-loop.html
- https://segmentfault.com/a/1190000010622146
- https://www.cnblogs.com/lsgxeva/p/7976217.html
- https://jakearchibald.com/2015/tasks-microtasks-queues-and-schedules/
- https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/
