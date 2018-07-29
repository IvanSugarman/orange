#### prototype
JavaScript对象中有一个特殊的[prototype]内置属性，其实是对于其他对象的引用。几乎所有的对象在创建时prototype都会赋予一个非空值。

当你尝试引用对象的属性时会触发[get]这个属性，第一步检查对象本身是否有这个属性，如果有就引用他。如果这个属性不在对象中，就使用对象的prototype链。这个过程会**持续到找到匹配的属性名或者查找完整的prototype链**。所有普通的prototype链都会最终指向内置Object.prototype。

P.S 使用**For..in**遍历对象时原理和查找prototype链类似。任何可以通过原型链访问到的并且是enumerable的属性都会被枚举(使用hasOwnProperty解决)。使用**in操作符**检测是否存在时，同样查找对象的整条原型链。

#### 属性屏蔽
    myObject.foo = "bar";
如果foo不直接存在于myObject中而是存在原型链上层，将出现以下三种情况：
1. 如果prototype链上层存在foo访问属性，并且没有被标记为只读。那么直接在myObject中添加一个foo新属性，是屏蔽属性。
2. 上层存在foo并标记为只读，那么**无法修改已有属性或者在myObject上创建屏蔽属性**。严格模式下抛出错误，否则赋值语句会被忽略。
3. 如果在上层存在foo并且是一个setter,那么调用这个setter。foo不会被添加到myObject，也不会重新定义setter。

如果希望在第二第三中情况也屏蔽Foo,不能使用=赋值。使用Object.defineProperty()

## 类
JavaScript中只有对象。类无法描述对象的行为，对象直接定义自己的行为。
#### 类函数
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

#### constructor

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
 
 #### 常见的原型继承做法
 
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
#### 反射
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

#### 对象关联

- 原型链: prototype机制就是存在于对象中的一个内部连接，会引用其他对象。这个链接的作用是，如果在对象上没有找到需要的属性或者方法引用。引擎就会继续在prototype关联的对象上进行查找，以此类推。
- Object.create():创建一个新对象并把他关联到我们指定的对象。