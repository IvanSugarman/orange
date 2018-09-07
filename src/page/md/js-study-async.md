## 异步
标准ajax请求不是同步完成，当**现在**我们发出一个异步Ajax请求，在**将来**才会得到结果。通常使用一个称为回调函数的函数。
> 可以发送同步Ajax请求，但是在任何情况下都不应该使用这种方式。因为它会锁定浏览器UI，并阻塞所有的用户交互。

#### 概念
##### 事件循环
JavaScript引擎只是在需要的事情将给定的任意时刻执行程序中的单个代码块。 

所有的环境都存在一个共同的"thread"，即提供一种机制来处理多个块的执行，且执行每块时调用JavaScript引擎，这种机制被称为事件循环。事件循环的每一轮称为一个`tick`，而`setTimeout`是将代码块放在程序未来某个tick执行。
> 换句话说，js引擎没有时间概念，只是一个按需执行js任意代码的环境。事件调度总是由包含它的环境执行。

##### 完整运行
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

##### 任务队列
在es6中，有个新的概念建立在事件循环队列上，叫做任务队列(job queue)。任务队列是挂在每个tick之后的一个队列，在事件循环的每个tick中，可能出现的异步动作不会导致一个完整的新事件添加到事件队列中，而是在tick的任务队列尾部添加一个项目。
> 理论上说，任务循环可能无限循环(一个任务总是添加另一个任务),进而导致程序的饿死而无法转移到下一个事件循环tick

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

#### 回调
在js中，回调是编写和处理程序异步逻辑最常用的逻辑。但是随着js的发展，对于异步编程，回调已经不够用了。
1. 大脑对于事件的计划方式是线性的、阻塞的、单线程的语义。但是回调表达异步流程是非线性的、非顺序的。
2. 回调会受控制反转的影响，因为回调暗中把控制权交给第三方来调用代码中的continuation。这种控制转移将会导致一系列的信任问题。
3. 用于解决信任问题的特定逻辑难度高于应有水平，而且可能会产生更笨重与更难维护的代码。

## Promise
如果我们把控制反转再反转回来，不把自己程序的continuation传给第三方，而是由第三方给我们提供了解其任务何时结束的能力，然后由代码决定下一步做什么。这种范式被称为Promise

##### Promise值
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

##### 具有then方法的鸭子类型
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

## 生成器
在回调表达异步控制流程存在两个关键缺陷：
- 基于回调的异步不太符合大脑对任务步骤的规划
- 由于控制反转，回调不是可信任或可组合的

es6 generator为我们提供一种顺序、看似同步的异步流程控制表达风格。

#### 基础
在es6之前，js存在普遍依赖的一个假定，一旦一个函数开始执行就会运行到结束，期间不会有其他代码能够打断他并插入其间。es6引入了一个新的**函数类型**，并不符合这种运行到结束的特性。这类函数称为生成器。

##### 栗子
在抢占式多线程语言中，bar可以在两个语句中打断并执行。但是js是非抢占也暂时不是多线程的。如果foo()自身可以通过某种形式在代码的这个位置指示暂停的话，就仍然可以以一种**合作式**的方式实现这样的中断。es6使用yield作为暂停点语法，表达了一种合作式的控制放弃。

> `function* foo()`与`function *foo()`在语法与功能上是等同的。第二种方式在使用`*foo`引用生成器时会比较一致。

```javascript
/* 只有bar()在foo中，才会在两个语句中打断并执行 */
var x = 1;

function foo() {
    x++;
    bar();
    console.log(x);
}

function bar() {
    x++;
}

foo()

/* es6合作式并发 */

function *foo() {
    x++;
    yield; //pause
    console.log(x);        
}

// 此处构造一个迭代器it控制此生成器
var it = foo(); 

// 启动foo()
it.next();
x; // 2
bar();
x; // 3
it.next();
```

##### 输入与输出
生成器函数只是一个特殊的函数，其基本的特性没有改变。仍然可以接受输入输出。
```javascript
function *foo(x) {
    var y = x * (yield "Hello");    // yield一个值
    return y;
}
var it = foo(6);

var res = it.next(); // 第一个next并不传入任何东西
res.value;           // "Hello" 

res = it.next(7);    // 向等待的yield传入7
res.value; // 42     // 42
```
在`*foo`内部，执行语句`y=x..`，之后跟随一个yield表达式，会在这一点上暂停`*foo`(在赋值语句的中间)，并在本质上要求调用代码为yield表达式提供一个结果值。之后调用`it.next(7)`这一句将7传回作为被暂停的yield表达式的结果。第一个next调用(无参)提出一个问题：生成器`*foo`要给我的下一个值是什么？第一个yield "hello"回答了此表达式。最后一个`it.next(7)`的调用再次提出了这样的问题：生成器产生的下一个值是什么？此时没有yield语句来回答这个问题了，是通过return语句来回答的。如果没有return语句的情况下实际返回的是`undefined`

> 一般来说，yield和next调用会有一个不匹配，需要的next要比yield语句多一个。因为第一个next()总是启动一个生成器，并运行到第一个yield处。之后第二个next()调用完成第一个被暂停的yield表达式，依次类推。yield作为一个表达式可以发出消息响应next调用，next()也可以向暂停的yield表达式发送值。yield和next组合在生成器的执行过程中构成了一个双向消息传递系统

##### 多实例
每次构建一个迭代器，实际上是隐式构建了**生成器的一个实例**，通过这个迭代器控制的是此生成器实例。同一个生成器的多个实例可以同时运行甚至可以彼此交互。
```javascript
function *foo() {
    var x = yield 2;
    z++;
    var y = yield (x * z);
    console.log(x, y, z);        
}

var z = 1;
var it1 = foo();
var it2 = foo();

var val1 = it1.next().value; // 2
var val2 = it2.next().value; // 2

val1 = it1.next(val2 * 10).value; // x: 20, z: 2
val2 = it2.next(val1 * 5).value;  // x: 200, z: 3

it1.next(val2 / 2); // y: 300
                    // 20 300 3
it2.next(val1 / 4); // y: 10
                    // 200 10 3
```
对于某些情况函数，使用生成器的话交替执行是完全可能的。根据迭代器控制的每个函数调用顺序的不同，可能会产生不同的结果。

#### 迭代器
迭代器是一个定义良好的接口，用于从一个生产者一步步得到一系列值。js迭代器的接口与其他语言类似，每次想要从生产者得到下一个值时调用next()。如给数字序列生成器实现标准的迭代器接口。除了构造自己的迭代器，ES6开始js的内建数据结构都存在默认迭代器。
> for..of循环在每次迭代中自动调用next()，不会向next传入任何值，在接受到`done: true`之后自动停止，这对于循环一组数据很方便。
```javascript
var something = (function() {
   var nextVal;
   
   return {
        // es6 for ... of 需要
        [Symbol.iterator]: function() { return this; }
        next: function() {
            if (nextVal === undefined) { 
                nextVal = 1;
            } else {
                nextVal = (3 * nextVal) + 6;    
            }    
            return { done: false, value: nextVal };
        }   
    } 
});
```

##### iterable
指包含可以在其值上迭代的迭代器的对象。从ES6开始，iterable如果需要提取迭代器，则必须支持一个函数，其名称是专门的ES6符号值[Symbol.iterator]。调用这个函数时，会返回一个迭代器。对于for..of循环来说，其每次循环并且调用它的Symbol.iterator函数。

可以把生成器看成一个值的生产者，我们通过迭代器接口的next()调用一次提取出一个值。**生成器本身并不是iterable，尽管他们很类似。执行一个生成器，就能得到一个迭代器。**可以通过生成器来替代闭包实现无限数字序列生产者。生成器会在每次迭代中暂停，函数`*something()`的状态会被保持，如此就不需要闭包在调用之间保持变量。
```javascript
function *something() {
    var nextVal;
    
    while (true) {
        if (nextVal === undefined) {
            next = 1;    
        } else {
            nextVal = (3 * nextVal) + 6;    
        }

        yield nextVal;
    }        
}
```

##### 提前终止
如果`*something()`生成器的迭代器实例可能在循环中break调用后永远留在挂起状态。for...of循环的“异常结束”，通常由break、return或者未捕获异常引起，会向生成器的迭代器发送一个信号使其终止。
```
for (var v of if) {
    console.log(v);
    
    if (v > 500) {
        // 完成生成器的迭代器
        console.log(it.return("Hello World").value);        
    }    
}
```
调用`it.return()`之后，会立即终止生成器，这回运行finally语句，也会把返回的value设置为传入return的内容。生成器的迭代器已经被设置为`done:true`

#### 异步迭代生成器
- 对于传统的ajax回调而言
```javascript
function foo(url, cb) {
    ajax(url, cb);
}

foo ("example", function(err, text) {
    // do something    
});
```

- 如果想要通过生成器表示同样的流程控制
```javascript
function foo(url) {
    ajax(url, function() {
        if (err) {
            // 给*main抛出一个错误
            it.throw(err);
        } else {
            // 用收到的数据恢复*main()
            it.next(data);    
        }
    });    
}

function *main() {
    try {
        var text = yield foo("example") ;
        console.log(text);
    } catch (err) { console.error(err); }
}

var it = main();

// start
it.next();
```
这意味着我们在生成器内部有着看似完全同步的代码，但是在`foo(..)`内的运行可以完全异步。我们可以以同步形式追踪流程控制，发出一个ajax，等它完成之后打印结果。

##### 同步错误处理
之前的生成器代码带来的另一个好处是使用`try..catch`，调用`foo(..)`是异步完成的，之前的try..catch无法捕获异步错误的。yield暂停使得生成器能够捕获错误，外界可以并将错误抛入。同时，也可以从生成器向外抛出错误。在外层进行处理。

#### 生成器 + Promise
生成器具有顺序性和合理性方面的优点。而Promise具有可信任与可组合的优点。

在一个综合两者的场景里，迭代器的作用应该是侦听这个promise的决议(完成/拒绝)，之后要么使用消息恢复生成器运行，要么向生成器抛出一个带拒绝原因的错误。获得Promise和生成器最大效用的方法是**yield出来一个Promise，然后通过这个Promise来控制生成器的迭代器。**
```javascript
function foo() {
    return request("example");    
}

// main中的代码无需改变, 其内部透明
function *main() {
    try {
        var text = yield foo();
        console/log(text);    
    } catch (e) { console.log(e); }
}

var it = main();

var p = it.next().value;

// 由promise进行决议
p.then(function(text) {
   it.next(text); 
}, function(err) {
   it.throw(err);
});
```

#### async与await
之前的模式是通过生成器yield出Promise，然后其控制生成器的迭代器来执行它直到结束。但是往往我们需要通过库工具辅助函数来实现。在ES6,ES7中开始存在语法上的支持。
- 我们不通过单独写生成器与迭代器等再触发和驱动main, 它只是被当成一个普通函数调用。
- main也不被声明为生成器函数而是作为async函数存在。
- 不再通过yield出Promise，而是await等待他决议
- 如果await了一个Promise, async函数会自动知道要做什么，会暂停这个函数，直到Promise决议。

```javascript
function foo() {
    return request("example");    
}

async function main() {
    try {
        var text = await foo();
        console.log(text);    
    } catch(err) { console.log(err); }
}

main();
```

#### 生成器委托
```javascript
function *foo() {
	console.log("*foo() starting");
	yield 3；
	yield 4;
	console.log("*foo() finished");
}

function *bar() {
	yield 1;
	yield 2;
	yield *foo(); // yield委托！
	yield 5;
}

var it = bar();

it.next().value; // 1
it.next().value; // 2
it.next().value; // *foo() starting
				 // 3
it.next().value; // 4
it.next().value; // *foo() finished
```
`yield *foo()`委托调用了foo()创建一个迭代器，然后`yield *`把迭代器实例控制(当前`*bar()`生成器的)委托转移到了这另一个`*foo()`迭代器。所以前面两个`it.next()`调用的是`*bar()`。当第三个`it.next()`调用时，`*foo()`启动了，`*bar()`把自己的迭代控制委托给了`*foo()`，一旦it迭代器控制消耗了整个`*foo()`迭代器，it就会自动转回控制`*bar()`。

> 实际上，可以yield委托到任意iterable, yield `*[1, 2, 3]`会消耗数组值`[1, 2, 3]`的默认迭代器。

上方的yield委托不只用于迭代器控制工作，也用于双向消息传递工作。实际上对于外层的迭代器it角度来说，控制最开始的生成器还是控制委托的那个，没有任何区别。
> yield委托甚至并不要求必须转到另一个生成器，它也可以转到一个非生成器的一般iterable。

##### 异步委托
在`*bar()`内部无需调用`yield run(foo)`，而是通过`yield *foo()`。这个例子之前版本中使用Promise机制(通过run来控制)把值从`*foo()`内的return r3传递给`*bar()`内的局部变量r3，现在这个值只需要通过`yield *`机制就可以直接返回。

```javascript
function *foo() {
	var r2 = yield request( "http://some.url.2" );
	var r3 = yield request( "http://some.url.3/?v=" + r2 );
	return r3;
}

function *bar() {
	var r1 = yield request( "http://some.url.1" );
	var r3 = yield *foo();
	console.log( r3 );
}

run( bar );
```

## 小结
- Promise解决了我们因回调的控制反转问题
- Promise没有摈弃回调，只是将其安排转交给了一个位于我们与其他工具之间的可信任的中介机制。
- 生成器提供了顺序的方式表达异步流的更好的办法。
- 生成器是ES6的一个新的函数类型，它不像普通函数那样总是运行到结束。而是可以在运行中暂停，并将来再从暂停的地方恢复运行。
- 这种交替的暂停和恢复是**合作性的**而非抢占式的，生成器具有能力通过yield来暂停自身，不过只有控制生成器的迭代器具有恢复生成器的能力。
- yield/next不仅仅是一种控制机制，实际上也是一种双向消息传递机制。yield本质上是**暂停下来等待某个值**，而next调用会向被暂停的yield表达式传回一个值(或者是隐式的undefined)。
- 在异步控制流程方面，生成器的优点是其内部的代码是以自然的同步方式表达任务的一系列步骤，我们把可能异步隐藏在关键字yield的后面，将异步移动到控制生成器的迭代器的代码部分。
