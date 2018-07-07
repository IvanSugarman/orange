#### 编译原理
1. 分词/语法分析
2. 解析/语法分析
3. 代码生成

#### var = 2
##### 参与者
- 引擎:从头到尾负责JavaScript的编译与执行过程
- 编译器: 负责语法生成与代码生成
- 作用域: 负责收集并维护由所有声明的标志符(变量)组成的一系列查询，确定当前代码的访问权限

##### 流程
1. 编译器将这段代码分为**词法单元**，将词法单元解析成一个**树结构**。
2. 遇上var a，编译器会云纹作用于是否有一个**该名称的变量**存在与**同一个作用域**的集合中。存在的话，编译器忽略声明继续进行编译，否则会在当前作用域的集合中声明一个新的变量命名为a。
3. 编译器为引擎提供运行时所需代码用来处理a = 2这个赋值操作。引擎运行时询问作用域。**当前作用域集合**中是否存在a的变量，如果是，引用该变量，如果否，继续查找该变量。
4. 引擎找到了a，将2赋值给他。否则抛出一个异常。

##### 编译器术语
1. LHS：赋值操作的目标是谁(a =)，当LHS查询时，如果顶层也无法找到该变量。全局作用域就会创建一个该变量，并将其返回给引擎。(非严格模式下) 
2. RHS：谁是赋值操作的源头(= a)。当RHS查询时，如果在顶层也无法找到需要的变量，引擎会抛出ReferenceError异常。如果RHS查询找到了一个变量，但是你尝试进行不合理的操作。引擎会抛出另一种类型异常TypeError.

##### 作用域嵌套
引擎从当前的执行作用域开始查找变量，如果找不到，就向上一级继续查找。当抵达最外层的全局作用域时。无论找没找到。查找过程都停止。

## 词法作用域
#### 作用域的两种工作模型
- 词法作用域(<= JavaScript):定义时作用域已经确定好

```
 function foo(){
     console.log(a);
 }
 
 function bar(){
     var a = 3;
     foo();
 }
 var a = 2;
 bar(); //输出2;
```

- 动态作用域:根据运行时来确定词法作用域，在上方例子中bar()会输出3

#### 词法阶段
编译器的第一个工作阶段叫做**词法化**，会对源代码的字符进行检查，如果有状态的解析过程，还会赋予单词语义。

简单来说，词法作用域就是定义在词法阶段的作用域。由你**在写代码时将变量和块作用域写在哪里**决定。其**处理代码时保持作用域不变**。(大部分情况)

- 作用域查找会在找到第一个匹配的标识符时停止。多层的作用域中可以定义同名的标识符，这叫做**遮蔽效应**，即内部的标识符遮蔽了外部的标识符。
- 无论函数在哪里调用，如何被调用。词法作用域都只由函数被声明的位置所决定。

#### 欺骗词法
可以有两种办法来达到欺骗词法的目的。但是欺骗词法作用域会导**致性能下降**。
1. eval
    
    eval接受一个字符串作为参数，并将其中的内容视为好像在书写时存在程序这个位置。
2. with
    
    with通常被当作重复引用同一个对象中的多个属性的快捷方式。可以不需要引用对象本身
        
```
    function foo(obj){
        with(obj){
            a = 2;
        }
    }
    var o1 = { a: 3 };
    var o2 = { b: 3 };
    
    foo(o1);
    console.log(o1.a); // 2
    
    foo(o2);
    console.log(o2.a); //undefined
    console.log(a); //2 -- a已经泄露到全局作用域上了
```
with会将一个没有或有多个属性的对象处理为一个完全隔离的词法作用域。因此这个对象的属性也会被处理为定义在这个作用于中的词法标识符。实际上是给你传递的对象凭空创建了**全新的词法作用域**。

在o2中，因为无法在该词法作用域中寻找到a变量，所以进行正常的LHS查询。自动创建了一个全局变量。

3. 性能

eval与with在运行时创建或者修改新的作用域。以此欺骗其他在书写时定义的词法作用域。JavaScript引擎无法在词法分析阶段确定作用域。无法进行相关的优化工作。

## 函数作用域与块作用域

#### 立即执行函数表达式(IIFE)
- 进阶用法1

```
var a = 2;
(function IIFE(global){
    var a = 3;
    console.log(a); // 3
    console.log(global.a); // 2
})(window);
console.log(a); // 2
```
处理了全局对象与函数作用域内对象的协调。并且显示的引用的全局对象变量。

- 进阶用法2

```
undefined = true; 
(function IIFE(undefined){
    var a;
    if(a === undefined){
        console.log("Undefined is safe here");
    }
})();
```
解决了undefined标识符的默认值被错误覆盖导致的异常。将参数命名为undefined，但是在对应的位置并不传入值。保证代码块中undefined标识符的正确性。

#### 块作用域
在JavaScript说明中并没有块作用域的相关功能。在以下几种情况会提供块作用于。
1. with

    with会为传入的对象提供一个全新的块作用域。
2. try/catch

    在ES3规范中规定的try/catch的catch分句会创建一个块作用域。其中声明的变量仅在catch中内部有效。
3. let(es6)

    let关键字可以将变量绑定到所在的任意作用域中(通常是{..}内部)。let为其变量**隐式的劫持了所在的块作用域**。所以，为块作用域显示的创建{}块，有利于提升代码的可读性。
    
    let所在的作用域，**变量不会提升**。
    
## 作用域闭包
当函数可以记住并访问所在的词法作用域时，就产生了闭包，即使函数是在当前作用域之外执行。

```
    function foo(){
        var a = 2;
        
        function bar(){
            console.log(a);
        }
        return bar;
    }
    var baz = foo();
    baz(); //2 --闭包
```
函数bar()的词法作用于能访问foo()的词法作用域。将bar()函数本身作为值类型进行传递。foo()执行后，返回值赋值给变量baz并调用baz()，**实际上是通过不同的标识符引用调用的内部的函数bar()。** bar可以正常执行，这个例子中在**其定义的词法作用于外的地方执行**。

在foo()执行后，通常期待foo()整个内部作用域都被销毁，但是bar()使用了这个内部作用域。因为bar()声明位置在**全局作用域**。**其拥有涵盖foo()内部作用域的闭包**，所以该作用域能一直存活。

bar()依然持有对这个作用域的引用，这个引用就叫闭包。这个函数**在定义时的词法作用域以外的地方被调用**，闭包使得函数可以继续访问定义时的词法作用域。所以，**当内部函数传递到词法作用域外，被别处调用，其持有原始定义的作用域的引用，这就使用了闭包。**

#### 模块

```
    function Module(){
        var a = 2;
        var b = [1,2,3];
        
        function something(){
            console.log(a);
        }
        
        function anotherThing(){
            console.log(b.join("|"));
        }
        
        return {
            something: something,
            anotherThing: anotherThing,
        }
    }
    
    var foo = Module();
    foo.something(); // 2
    foo.anotherThing(); // 1|2|3
```

模块模式需要以下两个条件:
1. 必须有外部的封闭函数，至少被调用一次(每次调用都会创建一个新的模块实例)
2. 封闭函数必须返回至少一个内部函数，这样内部函数才能在私有作用域中生成闭包，并且可以访问或者修改私有的状态。

可以通过IIFE进行简单的改进实现模块的单例模式。

另一个用法是命名将要作为公共API返回的对象

```
    var foo = (function coolModule(id){
        function change(){
            publicAPI.identity = identity2;
        }
        
        function identity1(){
            console.log("foo 1");
        }
        
        function identity2(){
            console.log("foo 2");
        }
        
        var publicAPI = {
            change: change,
            identity: identity1,
        }
        return publicAPI;
    })("foo module");
    
    foo.identity(); //foo 1
    foo.change();
    foo.identity(); //foo 2
```

在现代的模块机制中，大多数模块依赖加载器本质上是将模块定义封装成一个友好的api。

```
    var MyModules = (function(){
        var module = {};
        
        function define(name,deps,impl){
            for(var i =0;i<deps.length;i++){
                deps[i] = modules[deps[i]];
            }
            modules[name] = impl.apply(impl,deps);
        }
        
        function get(name){
            return modules[name];
        }
        
        return {
            define: define,
            get: get,
        }
    })
```
其代码核心为modules[name] = impl.apply(impl,deps)引入了包装函数，可以传入任何依赖，并且将返回值，存储在一个根据名字来管理的模块列表中。
使用如下：

```
 MyModules.define("foo",["bar"],function(){
     var hungry = "hippo";
     
     function awesome(){
         console.log(bar.hello(hungry).toUpperCase());
     }
     
     return {
         awesome: awesome
     }
 });
 
 var foo = MyModules.get("foo");
 foo.awesome();
```


