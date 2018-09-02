## this
this提供了一种更优雅的方式来隐式的传递一个对象引用,因此可以将API设计得更加简洁并且易于复用。
#### this的作用域
需要明确的是，this在任何情况下都不**指向函数的词法作用域**。需要注意的是，在JavaScript内部，作用域"对象"没有办法通过JS代码进行访问，他只存在**Javascript引擎内部**。
#### 定义
this是在**运行时进行绑定**的，并不是在编译时绑定。其上下文取决于函数调用时的各种条件。this的绑定和函数声明位置没有任何关系，只取决于**函数的调用方式**。
#### this的绑定规则
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

#### 判断优先级
按如下规则判断this的调用规则
1. 函数是否在new中调用?如果是的话this绑定新创建对象
2. 函数是否通过call，apply显式绑定？如果是的话this绑定指定对象
3. 函数是否在某个上下文中调用?如果是的话，this绑定的是指定的对象
4. 如果上述不是，则使用默认绑定，严格模式绑定为undefined,非严格模式下绑定到全局对象

#### 特殊情况
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