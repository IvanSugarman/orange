## 异步
#### ajax请求
标准ajax请求不是同步完成，当**现在**我们发出一个异步Ajax请求，在**将来**才会得到结果。通常使用一个称为回调函数的函数。
> 可以发送同步Ajax请求，但是在任何情况下都不应该使用这种方式。因为它会锁定浏览器UI，并阻塞所有的用户交互。

#### 事件循环
JavaScript引擎只是在需要的事情将给定的任意时刻执行程序中的单个代码块。 

所有的环境都存在一个共同的"thread"，即提供一种机制来处理多个块的执行，且执行每块时调用JavaScript引擎，这种机制被称为事件循环。事件循环的每一轮称为一个`tick`，而`setTimeout`是将代码块放在程序未来某个tick执行。
> 换句话说，js引擎没有时间概念，只是一个按需执行js任意代码的环境。事件调度总是由包含它的环境执行。

#### 完整运行
由于JavaScript的单线程特性，单一函数中的代码具有原子性，一旦开始运行，所有代码都会在下一个方法的代码运行之前完成，或者相反。这称为**完整运行**特性。

> 竞态条件：同一段代码存在多个不同的可能输出。这种不确定性是在函数(事件)级别上，而不是多线程情况下的语句级别(表达式运算顺序级别)。此种函数顺序的不确定性就是通常所说的竞态条件。即foo()和bar()相互竞争，看谁先运行。无法预料a和b的最终结果，所以才是竞态条件。

#### 并发
假设有一个展示状态更新列表的网站，随着用户向下滚动逐渐加载内容。要正确实现两个特性，需要两个独立"进程"同时运行。(在同一段时间而不需要在同一时刻)
- 在用户向下滚动页面触发onscroll事件发起ajax请求新的内容
- 接受ajax响应并显示

如果用户滚动足够快，等待第一个响应返回并处理的时候可能会看到两个或者更多的onscroll事件触发，因此得到彼此交替的onscroll事件和ajax响应事件。此时事件循环中可能出现**不同顺序**的交替事件。进程1和进程2并发运行，但是它们的各个事件时在事件循环队列中依次执行的。单线程事件循环是并发的一种形式。

##### 非交互
两个进程在同一程序内并发的交替运行他们的步骤/事件，任务彼此不相关。不需要交互。其不确定性是完全可以被接受的。
> 这不是竞态条件的bug，因为不论顺序。代码总会工作。

##### 交互
更常见的情况在于并发的进程需要相互交流，通过作用域或者DOM间接交互。如果出现就需要对其交互进行协调避免竞态出现。

##### 并发协作
其目标是取得一个长期运行的“进程”，并将其分割成多个步骤或多批任务，使得其他并发进程有机会将自己的运算插入到事件循环队列中交替进行。
> 假设运行一个Array.map，其记录过千万条。那么取得结果后其运行时间将会一直占用事件循环。其他代码不能执行，也无法有其他的response调用或者UI刷新。其解决办法可以异步地批处理这些结果，并且每次处理之后返回事件循环，让其他等待事件有机会执行。

```js
var res = [];

// response
function response(data) {
    // 一次处理1000个
    var chunk = data.splice(0, 1000);
    
    // 添加到已有的res组
    res = res.concat(
        chunk.map(function(val) {
            // do something
        });
    );
    
    // 处理剩余
    if (data.length > 0) {
        // 异度调度下次批处理
        setTimeout(function() {
            response(data);    
        }, 0);    
    }   
}

ajax('http://some.url', response);
```

#### 任务
在es6中，有个新的概念建立在事件循环对了上，叫做任务队列(job queue)。任务队列是挂在每个tick之后的一个队列，在事件循环的每个tick中，可能出现的异步动作不会导致一个完整的新事件添加到事件队列中，而是在tick的任务队列尾部添加一个项目。
> 理论上说，任务循环可能无限循环(一个任务总是添加另一个任务),进而导致程序的饿死而无法转移到下一个事件循环tick

## 回调
在js中，回调是编写和处理程序异步逻辑最常用的逻辑。但是随着js的发展，对于异步编程，回调已经不够用了。
1. 大脑对于事件的计划方式是线性的、阻塞的、单线程的语义。但是回调表达异步流程是非线性的、非顺序的。
2. 回调会受控制反转的影响，因为回调暗中把控制权交给第三方来调用代码中的continuation。这种控制转移将会导致一系列的信任问题。
3. 用于解决信任问题的特定逻辑难度高于应有水平，而且可能会产生更笨重与更难维护的代码。

## Promise
如果我们把控制反转再反转回来，不把自己程序的continuation传给第三方，而是由第三方给我们提供了解其任务何时结束的能力，然后由代码决定下一步做什么。这种范式被称为Promise

#### Promise值
Promise本身与时间无关，其封装了底层值完成或者拒绝。Promise可以按照可预测的方式组合而不用关心时序或底层的结果。一旦Promise决议，就永远保持在这个状态而成为**不变值**
- pending
- Resolve
- Reject

#### 完成事件
也可以从另一个角度看待Promise的协议： 为异步任务作为两个或者更多步骤的流程控制机制，时序上的this-then-that。
> 假设要调用一个函数foo()执行某个任务。我们不知道也不关心其具体细节。这个函数可能需要n的时间才能完成。我们只需要知道foo()什么时候结束这样进行下一步。在典型的JavaScript中，如果需要侦听通知，可以将通知的需求组织为对foo()发出的一个**完成事件**的侦听。

**对于回调，通知就是任务(foo)调用的回调。而使用Promise的话，我们将这个关系反转，侦听来自foo的事件，得到通知的时候情况继续。**

```javascript
function foo(x) {
    // do some job
    // 构造listener事件通知处理对象返回
    return listener;
}

var evt = foo(42);

evt.on('completion', function(){
    // do next step 
});

evt.on('error', function(){
    // do error
});

```

foo()显示的创建并返回了一个事件订阅对象，调用代码得到这个对象，并在其上注册了两个事件处理函数。相对于面向回调的代码，这里的反转是显而易见的。这里没有把回调传给foo()，而是返回一个名为ext的事件注册对象，由他接受回调。一个重要的好处在于，可以把这个事件侦听提供给代码中多个部分，在foo()完成的时候，都可以独立的收到通知，各自执行下一步。从本质上来说，**事件监听对象evt就是Promise**的一个模拟。
> 回调本身表达了一种控制反转，所以对回调的反转实际上是对反转的反转(反控制反转)，即把控制返还给调用代码。

#### 具有then方法的鸭子类型
如何确定一个值是否是真正的Promise?

虽然Promise通过new Promise()创建的, 但无法通过p instanceof Promise来检查。原因如下:
- Promise值可能是从其他浏览器窗口(或者iframe)拿到的，这个浏览器窗口自己的Promise与当前窗口的不同，无法识别Promise实例
- 库或者框架可能会选择实现自己的Promise而非用原生Promise实现(早期根本没有Promise实现的浏览器中使用库)

因此，识别Promise就是定义某种称为thenable的东西，将其定义为任何具有then(..)方法的对象和函数。此值是Promise一致的thenable。
> 根据一个值的形态对这个值的属性做一些假定。这种类型检查一般用术语鸭子类型来表示。

这样存在其他问题，只要存在then属性的都会被看成是Promise对象。在ES6之前，社区已经有一些著名的非Promise库也存在名为then方法。这些库有些重新命名，有些无法改变摆脱冲突。标准决定劫持之前未保留的属性名then。**这意味着所有值，不管是过去现在还是未来，都无法拥有then函数，否则这个值在Promise中会被认为是一个thenable**。

#### Promise信任问题
在回调函数中存在的一些信任上的问题。
1. 调用过早
2. 调用过晚
    只有当Promise对象调用Resolve()或者Reject()时，Promise的then注册的观察回调就会被自动调度。这些被调度的回调在下一个异步事件点上一定会被触发。在一个Promise决议后，这个Promise上所有的通过then()注册的回调都会在下一个异步时机点上被依次调用。回调的任意一个无法影响或者延误其他回调的调用。
> Promise可能存在细微调度上的差别，此种情况下两个独立Promise上链接的回调相对顺序无法可靠预测。永远不要依赖于不同Promise间的顺序和调度。
3. 回调未调用
   - Promise必须从决议中给出一个结果
   - 如果Promise本身永远不被决议，Promise提供了一种解决方案，其使用了一种**竞态**的高级抽象机制。
   ```javascript
    function timeoutPromise(delay) {
        return new Promise(function(resolve, reject) {
           setTimeout(function() {
               reject("Time out");    
           }, delay); 
        }); 
    }
   ```
4. 未能传递参数值
Promise中，如果没有使用值显示决议，此值为undefined。不论这个值是什么，都会被传给所有注册的回调。还有一点，如果使用多个参数调用resolve或者reject，第一个参数之后的所有参数都会被忽略。

#### 链式流
Promise不止是一个单步执行thie-then-that操作的机制。我们可以将多个Promise连接到一起表示一系列异步步骤。
- 每次对Promise调用then(), 都会创建并返回一个新的Promise
- 如果在完成或者拒绝处理函数内部，返回一个值或抛出一个异常，新返回的(可连接)的Promise就相应的决议
- 如果完成或拒绝处理函数返回一个Promise，将会被好在哪开，不管其决议值是什么，都会成为当前then()返回的链接Promise的决议值。 

> 使得Promise序列真正能够在每一步有异步能力的关键是，Promise.resolve()/reject()传递的是一个Promise或thenable而不是其函数的最终值。Promise.resolve()会直接返回接受到的真正Promise，或者展开接受到的thenable并在同时递归的前进。所以在then方法的内部，尽量显示的使用return或者throw，不显示的调用return会返回undefined。

##### Promise坠落
关于以下代码
```javascript
Promise.resolve('foo').then(Promise.resolve('bar')).then(function(result) {
    // 输出foo
    console.log(result); 
});
```

产生这样的输出是因为给then方法传递了一个非函数(比如promise对象)的值，代码会理解为`then(null)`，因此前一个promise的结果产生了坠落的效果。

#### 错误处理
1. error-first回调风格
```javascript
foo ((err, val) => {
    if (err) {
        console.error(error);
    } else {
        console.log(val);    
    }
});
```

传给foo()的回调函数保留第一个参数err，用于在出错时接受信号，如果存在就任务出错。当多级error-first回调交织在一起，加上这些if，不可避免的导致了回调地狱风险。

2. split-callback分离回调风格
在Promise中使用分离回调，一个回调用于完成情况，一个回调用于拒绝情况。但是，如果通过无效的方式使用Promise API并且出现一个错误阻碍了正常的Promise构造，结果会得到一个立即抛出的异常而不是一个被拒绝的Promise。

为了避免丢失忽略和抛弃的Promise错误，Promise的最佳实践是**最后总以一个catch()结束**。如下例，没有为then传入拒绝处理函数，所以默认的处理函数被替换掉了，这样进入p的错误以及p之后的决议的错误都会传递到最后的handleErrors.
```javascript
var p = Promise.resolve(42);

p.then(
    function fulfilled(msg) {
        // 数字没有string函数，所以抛出错误
        console.log(msg.toLowerCase());        
    }
).catch(handleErrors);
```
> 不加catch()方法会让回调函数中抛出的异常被吞噬，在控制台看不到相应错误，尽量在promise调用链最后添加`.catch(console.log.bind(console));`


#### Promise模式
- Promise.all([])

等待两个或者更多并行/并发的任务完成才将继续。从Promise.all([])调用返回的promise会收到一个完成消息。这是一个由**所有传入promise的完成消息组成的数组，与指定的顺序一致**。严格来说，传给Promise.all的数组值可以是Promise、thenable甚至是立即值。就本质而言，其列表每个值都会通过Promise.resolve()过滤，以确保要等待的是一个真正的Promise，所以立即值会被规范化为值构建的Promise。如果数组为空，主Promise会立即完成。

> 应该为每一个promise关联一个拒绝/错误处理函数。尤其是从Promise.all([])返回的那个

- Promise.race([])
只响应第一个完成的Promise而抛弃其他Promise。Promise.race([])也接受单个数组参数，由一个或者多个Promise、thenable或立即值组成。一旦有任何一个Promise决议为完成，Promise.race([..])就会完成。一旦有任何一个Promise为拒绝，其就会拒绝。

> 如果传入了一个空数组，主race()的Promise将永远不会决议，而不是立即决议。在ES6中指定它完成或拒绝，抑或是抛出某种同步错误。但是Promise库时间上早于ES6，不得已而遗留了这个问题。

#### Promise API
1. new Promise((resolve, reject) => { // reject/resolve });
2. Promise.resolve() / Promise.reject() 
    Promise.reject用于创建一个已被拒绝的Promise的快捷方式。Promise.resolve用于创建一个已完成的Promise，但是其也会展开thenable值，在这种情况下，返回Promise采用传入的这个thenable的最终决议值，可能完成或者拒绝。如果传入是真正的Promise, Promise.resolve什么也不会做，只会将这个值返回。
3. then() / catch()
    每个Promise实例都有then与catch方法，决议后会马上调用两个处理函数之一。then接受一个或者两个参数，如果两者中的任何一个被省略或者作为非函数值传入的话，就会替换为相应的默认回调。默认完成回调只是把消息传递下去，默认拒绝回调则只是重新抛出其接受的出错原因。
    
    catch()只接受一个拒绝回调作为参数，并自动替换默认完成回调。其等价于`then(null, ..)` 

4. Promise.all([..]) / Promise.race([..])