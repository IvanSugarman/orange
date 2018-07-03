
## 对象

#### JavaScript基础

6种主要对象: string,number,boolean,null,undefind,object

内置对象: String,Number,Boolean,Object,Function,Array,RegExp,Date,Error

在必要时js会将字面量转化为相应的对象。null与undefined没有对应的额构造形式只有文字形式。Date只有构造形式，没有文字形式。

对象的内容是一些存储在特定命名位置的任意类型的值组成。称之为属性。在引擎内部，这些值的存储方式是多种多样的，一般并不会存储在**对象容器内部**。

访问值可以使用.操作符或者[]操作符。分别称为属性访问和键访问。其区别为[]可以接受任意UTF-8/Unicode字符串作为属性名。ES6中增加了可计算属性名。可以使用myObject[prefix + name]

#### 复制对象
- 对于JSON安全的对象来说可以使用


     var newObj = JSON.parse(JSON.stringify(someObj));
     
- ES6中定义了Object.assign()方法实现浅复制，他会遍历一个或多个源对象的所有可枚举自有键并复制到目标对象

#### 属性描述符
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

#### Getter与Setter
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

#### 存在性
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

## 混合对象"类"
类是一种设计模式，许多语言都提供了面向对象类软件设计的原生语法。JavaScript也提供了类似的语法，但是实际上与其他语言的类完全不同。

类意味着复制。在传统的类被实例化时，它的行为会复制到实例中。继承时，行为也会被复制到子类中。多态看上去似乎是从子类引用父类，但是本质上的引用其实是复制的结果。

而在JavaScript中并不会自动创建对象的副本。

### 混入
JavaScript中只有对象，并不存在可以被实例化的"类"。一个对象被赋值到其他对象中，他们只会被关联起来。所以开发者们也想出了一个办法来模拟类的赋值行为。即混入。

#### 显式混入
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
#### 隐式混入

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