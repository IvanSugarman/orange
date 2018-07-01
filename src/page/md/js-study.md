### 作用域

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

### 词法作用域
##### 作用域的两种工作模型
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

##### 词法阶段
编译器的第一个工作阶段叫做**词法化**，会对源代码的字符进行检查，如果有状态的解析过程，还会赋予单词语义。

简单来说，词法作用域就是定义在词法阶段的作用域。由你**在写代码时将变量和块作用域写在哪里**决定。其**处理代码时保持作用域不变**。(大部分情况)

- 作用域查找会在找到第一个匹配的标识符时停止。多层的作用域中可以定义同名的标识符，这叫做**遮蔽效应**，即内部的标识符遮蔽了外部的标识符。
- 无论函数在哪里调用，如何被调用。词法作用域都只由函数被声明的位置所决定。

##### 欺骗词法
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

### 函数作用域与块作用域

##### 立即执行函数表达式(IIFE)
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

##### 块作用域
在JavaScript说明中并没有块作用域的相关功能。在以下几种情况会提供块作用于。
1. with

    with会为传入的对象提供一个全新的块作用域。
2. try/catch

    在ES3规范中规定的try/catch的catch分句会创建一个块作用域。其中声明的变量仅在catch中内部有效。
3. let(es6)

    let关键字可以将变量绑定到所在的任意作用域中(通常是{..}内部)。let为其变量**隐式的劫持了所在的块作用域**。所以，为块作用域显示的创建{}块，有利于提升代码的可读性。
    
    let所在的作用域，**变量不会提升**。
    
### 作用域闭包
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

##### 模块

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

### 关于this
this提供了一种更优雅的方式来隐式的传递一个对象引用,因此可以将API设计得更加简洁并且易于复用。
##### this的作用域
需要明确的是，this在任何情况下都不**指向函数的词法作用域**。需要注意的是，在JavaScript内部，作用域"对象"没有办法通过JS代码进行访问，他只存在**Javascript引擎内部**。
##### 定义
this是在**运行时进行绑定**的，并不是在编译时绑定。其上下文取决于函数调用时的各种条件。this的绑定和函数声明位置没有任何关系，只取决于**函数的调用方式**。
##### this的绑定规则
this根据其调用位置分为四种规则。
1. 默认绑定
    
    独立函数的调用。此条规则为无法引用其他规则时的默认规则。 

```
function foo(){
    console.log(this.a);
}

var a = 2;
foo();  //2
```
    foo不带任何修饰的函数直接进行调用或者引用。

2. 隐式绑定

```
function foo(){
    console.log(this.a);
}

var bar = {
    a: 2,
    foo: foo,
}
bar.foo();  //2
```
调用位置使用了bar的上下文来引用函数。foo()被调用时加上了对bar的引用。

- 隐式丢失： 回调函数以传参的方式传入函数值。引用其函数本身。本质其实为隐式传值。故会令其丢失绑定的this

```
function foo(){
    console.log(this.a);
}
var obj = {
    a: 2,
    foo: foo,
}

var a = "oops,global";
setTimeout(obj.foo,1000); // "oops,global"
```
实际上,js中setTimeout的函数实现类似如下代码

```
function setTimeout(fn,delay){
    fn();  //这才是实际调用的位置，obj.foo只是foo函数的一个引用
}
```

3. 显示绑定

Javascript的绝大多数函数都可以使用call或者apply将上下文绑定到指定的对象上。

```
function foo(){
    console.log(this.a);
}
var obj = {
    a:2,
}
foo.call(obj); //2
```

**变种：硬绑定**

```
function foo(){
    console.log(this.a);
}

var obj = {
    a: 2,
}

var bar = function(){
    foo.call(obj);
}

bar(); //2
setTimeout(bar,100); //2

//硬绑定的bar无法再修改this;
bar.call(window); //2
```
以上变种是一种显示的强制绑定。典型应用场景是创建一个包裹函数负责接收参数并返回值。另一种使用方法是创建一个可以重复使用的辅助函数。(bind);

```
function bind(fn,obj){
    return function(){
        return apply(obj,arguments);
    }
}
```
在第三方库很多函数以及一些内置函数如forEach中，通常提供一个可选参数绑定上下文，均使用了call()或者apply()进行显示绑定。
4. new
包括内置对象函数在内的所有函数都可以被new来调用。这种调用实际被称为构造函数调用。实际并不存在所谓的**构造函数**，只有**对于函数的构造调用**。
在new构造函数的过程中，一般会发生以下操作。
- 创建一个全新的对象
- 这个对象执行prototype连接，连接在构造函数指向的对象，即fun.prototype
- 这个新对象会绑定到函数调用的this
- 如果函数没有返回其他对象，那么new表达式中的函数调用会自动返回这个对象。

```
function foo(a){
    this.a = a;
}
var bar = new foo(2);
console.log(bar.a); //2
```
这种方式被称为new绑定。

##### 判断优先级
按如下规则判断this的调用规则
1. 函数是否在new中调用?如果是的话this绑定新创建对象
2. 函数是否通过call，apply显式绑定？如果是的话this绑定指定对象
3. 函数是否在某个上下文中调用?如果是的话，this绑定的是指定的对象
4. 如果上述不是，则使用默认绑定，严格模式绑定为undefined,非严格模式下绑定到全局对象

##### 特殊情况
- null或者undefined作为this的绑定传入call或者apply，实际应用默认绑定规则
- 间接引用的情况下，应用默认绑定
- 软绑定

考虑到硬绑定可以把this绑定到指定的对象，**防止函数调用应用默认绑定规则**。如果可以给默认绑定指定一个全局对象和undefined之外的值，就可以实现和硬绑定相同的效果，同时保留隐式绑定或者显示绑定修改this的能力
```
if(!Function.prototype.softBind){
    Function.prototype.softBind = function(obj){
        var fn = this;
        //捕获所有curried参数
        var curried = [].slice.call(arguments,1);
        var bound = function(){
            return fn.apply(
            (!this || this === (window || global)) ? obj : this,
            curried.concat.apply(curried,arguments)
            );
        };
        bound.prototype = Object.create(fn.prototype);
        return bound;
    }
}
```
对指定的函数进行封装，首先检查调用时的this，如果this绑定到全局对象或者undefined，就把指定的默认对象obj绑定到this,否则不会修改this；

- 箭头函数

箭头函数中不适用this的四种标准规则，而是根据外层（函数或者全局）作用域来决定this。这其实和ES6之前代码中的self = this机制一样。

### 对象

##### JavaScript基础

6种主要对象: string,number,boolean,null,undefind,object

内置对象: String,Number,Boolean,Object,Function,Array,RegExp,Date,Error

在必要时js会将字面量转化为相应的对象。null与undefined没有对应的额构造形式只有文字形式。Date只有构造形式，没有文字形式。

对象的内容是一些存储在特定命名位置的任意类型的值组成。称之为属性。在引擎内部，这些值的存储方式是多种多样的，一般并不会存储在**对象容器内部**。

访问值可以使用.操作符或者[]操作符。分别称为属性访问和键访问。其区别为[]可以接受任意UTF-8/Unicode字符串作为属性名。ES6中增加了可计算属性名。可以使用myObject[prefix + name]

##### 复制对象
- 对于JSON安全的对象来说可以使用


     var newObj = JSON.parse(JSON.stringify(someObj));
     
- ES6中定义了Object.assign()方法实现浅复制，他会遍历一个或多个源对象的所有可枚举自有键并复制到目标对象

##### 属性描述符
在创建普通属性时属性描述符会使用默认值，我们也可以使用Object.defineProperty()来添加新属性或者修改一个属性。


```
var myObject = {};
Object.defineProperty(myObject,"a",{
    value: '2',
    writable: true,
    configurable:true,
    enumerable:true,
})
```

- writable: 决定是否可以修改属性的值
- configurable: 决定是否可以通过defineProperty来设置属性描述
- enumerable:决定是否可枚举

##### 不变性
- 对象常量:使用writable:false或者configurable:false可以设置一个对象常量
- 禁止扩展:可以使用Object.preventExtensions()禁止对象添加新属性并且保留已有属性
- 密封: Object.seal()，密封之后不仅不能添加新属性，也不能重新配置或者删除任何现有属性。
- 冻结: Object.freeze()。在Object.seal()的基础上设置所有属性writable:false

##### Getter与Setter
ES5中使用getter与setter可以改写单个属性的默认操作。对于访问描述符来说，js会忽略他们的value和writable特性，而关心set和get

```
    var myObject = {
        get a() {
            return 2;
        }
        set a(val){
            this.a = val;
        }
    }
```

##### 存在性
判断对象中是否存在这个属性:

```
    var obj = {
        a：2
    }
    
    ("a" in obj); //true
    ("b" in obj); //false
    
    obj.hasOwnProperty（"a"); // true
    obj.hasOwnProperty（"b"); // false
```
- in操作符检测属性是否在对象及其prototype原型链中。
- hasOwnProperty值只是否在myObject中，不检查原型链

属性的可枚举性或者不可枚举性决定他们是否出现在for..in循环中。

### 混合对象"类"
类是一种设计模式，许多语言都提供了面向对象类软件设计的原生语法。JavaScript也提供了类似的语法，但是实际上与其他语言的类完全不同。

类意味着复制。在传统的类被实例化时，它的行为会复制到实例中。继承时，行为也会被复制到子类中。多态看上去似乎是从子类引用父类，但是本质上的引用其实是复制的结果。

而在JavaScript中并不会自动创建对象的副本。

#### 混入
JavaScript中只有对象，并不存在可以被实例化的"类"。一个对象被赋值到其他对象中，他们只会被关联起来。所以开发者们也想出了一个办法来模拟类的赋值行为。即混入。

##### 显式混入
我们可以手动实现赋值功能。这个功能在许多库和框架中被称为extend()


```
    function mixin(sourceOBj,targetObj){
        for(var key in sourceObJ){
            if(!key in targetObj){
                targetObj[key] = sourceObj[key];
            }
        }
        return targetObj;
    }
    
    
    var Vehicle = {
        engines: 1,
        ignition: function(){
            console.log("Turning on my engine.");
        }
        drive: function(){
            this.ignition();
            console.log("Steering and moving forward!");
        }
    }
    
    var Car = mixin(Vehicle,{
        wheels: 4,
        drive:function(){
            Vehicle.drive.call(this); //显式多态
            console.log("rolling on all" + this.wheels);
        }
    })
```
这种混入包括以下特点
- 默认属性保持原状
- 函数复制仅仅复制引用
- 使用call/apply(this)来进行显示绑定，而使用子类对象执行父类方法。

寄生继承：是显式混入模型的一种变体。既是显式也是隐式。

```
    function Vehicle(){
        this.engines = 1;
    }
    
    Vehicle.prototype.ignition = function(){
       console.log("Turning on my engine.");
    }
    Vehicle.prototype.drive = function(){
            this.ignition();
            console.log("Steering and moving forward!");
    }
    
    //寄生类Car
    function Car(){
        //首先，Car是一个Vehicle
        var car = new Vehicle();
        
        //对car进行定制
        car.wheels = 4;
        
        //保存到Vehicle::drive的特殊引用
        var vehDrive = car.drive;
        
        //重写drive
        car.drive = function(){
            vehDrive.call(this);
            console.log("rolling on all" + this.wheels);
        }
        
        return car;
    }
```
##### 隐式混入

在JavaScript中使用**隐式混入**与**显式伪多态**都存在同样的问题，由于屏蔽会在所有需要使用多态引用的地方创建一个函数关联，这极大的增加了维护成本与代码复杂度。

```
    var Something = {
        cool: function(){
            this.greeting = "Hello World";
            this.count = this.count ? this.count+1 : 1;
        }
    }
    
    Something.cool();
    Something.greeting; // Hello World
    Something.count; // 1
    
    var Another = {
        cool: function(){
            //隐式把Something混入Another
            Something.cool.call(this);
        }
    };
    
    Another.cool();
    Another.greeting; // Hello World
    Another.count; // 1 不是共享状态
```
这类技术利用了this的重新绑定功能，但是Something.cool.call(this)任然无法变成相对引用。隐式混入只是直接在子类方法中覆盖并以call来调用父类函数。

### 原型

##### prototype
JavaScript对象中有一个特殊的[prototype]内置属性，其实是对于其他对象的引用。几乎所有的对象在创建时prototype都会赋予一个非空值。

当你尝试引用对象的属性时会触发[get]这个属性，第一步检查对象本身是否有这个属性，如果有就引用他。如果这个属性不在对象中，就使用对象的prototype链。这个过程会**持续到找到匹配的属性名或者查找完整的prototype链**。所有普通的prototype链都会最终指向内置Object.prototype。

P.S 使用**For..in**遍历对象时原理和查找prototype链类似。任何可以通过原型链访问到的并且是enumerable的属性都会被枚举(使用hasOwnProperty解决)。使用**in操作符**检测是否存在时，同样查找对象的整条原型链。

##### 属性屏蔽
    myObject.foo = "bar";
如果foo不直接存在于myObject中而是存在原型链上层，将出现以下三种情况：
1. 如果prototype链上层存在foo访问属性，并且没有被标记为只读。那么直接在myObject中添加一个foo新属性，是屏蔽属性。
2. 上层存在foo并标记为只读，那么**无法修改已有属性或者在myObject上创建屏蔽属性**。严格模式下抛出错误，否则赋值语句会被忽略。
3. 如果在上层存在foo并且是一个setter,那么调用这个setter。foo不会被添加到myObject，也不会重新定义setter。

如果希望在第二第三中情况也屏蔽Foo,不能使用=赋值。使用Object.defineProperty()

#### 类
JavaScript中只有对象。类无法描述对象的行为，对象直接定义自己的行为。
##### 类函数
所有的函数默认都会拥有一个名为Prototype的公有并不可枚举的属性。他会指向另一个对象，这一个对象通常被称为foo的原型。因为我们通过Foo.prototype属性引用来访问他。

这个对象是在调用new Foo()时创建的，最后会被**关联**到Foo.prototype这个对象上。

```
 function Foo(){
     // ..
 }
 
 var a = new Foo();
 
 Object.getPrototypeOf(a) === Foo.prototype; //true
```

这是因为，在JavaScript中没有类似复制的机制。无法创建一个类的多个实例。只能创造多个对象并关联到同一个对象。所以类的实例化，只是创建一个对象并让两个对象互相关联，这样一个对象就可以通过**委托**访问另一个对象的属性和函数。

##### constructor

```
    function Foo(){
        //..
    }
    
    Foo.prototype.constructor === Foo; //true
    
    var a = new Foo();
    a.constructor === Foo; //true
```

 Foo.prototype默认有一个共有并且不可枚举的属性.constructor,这个属性引用的是**对象关联的函数**。通过new Foo()创建的对象也具有.constructor属性，指向**创建这个对象的函数。**这不意味着a有一个指向Foo的.constructor属性。事实上，**.constructor属性同样被委托给了Foo.prototype**。
 
 一些随意的对象属性引用，实际上是不被信任的。a1.constructor这种，是非常不可靠并且不安全的引用。尽量避免使用这些引用。
 
 ##### 常见的原型继承做法
 
```
function Foo(name){
    this.name = name;
}

Foo.prototype.myName = function(){
    return this.name;
}

function Bar(name,label){
    Foo.call(this,name);
    this.label = label;
}

//创建一个新的Bar.prototype并关联到Foo.prototype
Bar.prototype = Object.create(Foo.prototype);
//注意需要手动修复Bar.prototype.constructor

Bar.prototype.myLabel = function(){
    return this.label;
}

var a = new Bar("a",'obj a');
a.myName(); //"a"
a.myLabel(); //"obj a"
```
要创建一个合适的关联对象，我们必须使用Object.create()而不是使用具有副作用的Foo()。使用new Foo()会产生一些修改状态，注册到其他对象，给this添加数据属性等的副作用。会影响到Bar()的后代。

在ES6中，产生了一个辅助函数可以用标准并且可靠的方法来修改关联。Object.setPrototypeOf(..)

```
//ES5 抛弃默认的Bar.prototype
Bar.prototype = Object.create(Foo.prototype);
//ES6 直接修改现有的Bar.prototype
Object.setPrototypeOf(Bar.prototype,Foo.prototype);

```
##### 反射
检查现有对象a委托的对象。如同传统语言中检查一个实例的继承祖先通常成功为反射。

- instanceof

        a instanceof Foo;
 instanceof回答的问题是，在a的整条prototype链中是否有指向Foo.prototype的对象。
 
- Foo.prototype.isPrototype(a)
isPrototype回答的问题是，在a的整条prototype链是否出现过Foo.prototype

- Object.getPrototypeOf(a);

直接获取一个对象的prototype值

- 大多数浏览器支持一种非标准的方法来访问内部prototype属性

        a.__proto__ === Foo.prototype; // true
        
 __proto的实现大致是这样的,存在于内置的Object.prototype中
    
```
    Object.defineProperty(Object.prototype,"__proto__",{
        get: function(){
            return Object.getPrototypeOf(this);
        }
        
        set: function(o){
            Object.setPrototypeOf(this,o);
            return o;
        }
    })
```

##### 对象关联

- 原型链: prototype机制就是存在于对象中的一个内部连接，会引用其他对象。这个链接的作用是，如果在对象上没有找到需要的属性或者方法引用。引擎就会继续在prototype关联的对象上进行查找，以此类推。
- Object.create():创建一个新对象并把他关联到我们指定的对象。
