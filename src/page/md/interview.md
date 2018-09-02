## 归纳整理
#### Promise原理、实现异步的方法 

resolved rejected pending三种状态，创建promise时该promise为pending状态，调用resolve()与reject()方法可以进行promise的状态变更。可以通过then进行链式调用，then包含两个参数，分别是成功resolved的回调和失败reject的回调，catch的作用则是捕捉promise的错误，与then的reject回调基本一致。但是promise的回调具有冒泡性质，能够不断传递，同时也可以catch到then的异常，所以可以集合在最后的catch进行处理。

promise.all() 当多个promise的状态都变为resolved时,promise才会变为resolved

promise.rice() 当多个promise中，只要有一个进行状态改变。promise就会立即变为相同状态并进行回调。

#### 前端路由的实现原理
a. html5 histroy api
主要包括两个api接口,history.pushState()与history.replaceState,他们分别接受三个参数
- 状态对象:  一个JavaScript对象，与用pushState()方法创建的新历史记录条目关联。无论何时用户导航到新创建的状态，popstate事件都会被触发，并且事件对象的state属性都包含历史记录条目的状态对象的拷贝。
- 标题: 传一个空字符串比较安全。也可以标记要进入的状态
- 地址: 新的历史记录的目的地址

如果运行 history.pushState() 方法，历史栈对应的纪录就会存入 状态对象，我们可以随时主动调用历史条目

b.hash
我们从Url看到的#被称为锚点。而路由里的#被称为hash。
我们需要一个根据监听哈希变化触发的事件 —— hashchange 事件

我们用 window.location 处理哈希的改变时不会重新渲染页面，而是当作新页面加到历史记录中，这样我们跳转页面就可以在 hashchange 事件中注册 ajax 从而改变页面内容。

hashchange 在低版本 IE 需要通过轮询监听 url 变化来实现

#### 手写after方式清除浮动，一个冒号和两个冒号的区别
- : 伪类
伪类存在的意义是，给某些特定的选择器增加样式。如:active :focus等

- ::before 伪元素(指: + 伪元素名称)
伪元素存在的意义是,其创建了一个虚假的元素，并插入到目标元素之前或之后。(DOM文档中并不实际改变什么)，但是对用户可见。

#### 盒子模型
IE盒子: content = border + padding + width
在IE6以及IE7 IE8的怪异模式下显示

W3C盒子: margin padding content border
box-sizing 设置盒子标准，最常用的是border-box与content-box

#### TCP三次握手
客户端像服务器发送链接请求，发送一个SYN信号。服务器确认之后返回客户端到服务器的链接成功信号(SYN+1),同时发送服务器链接客户端的信号(ACK)，客户端接受ACK之后返回服务器到客户端的链接成功信号(ACK+1),三次握手结束后tcp连接成功

四次挥手: FIN ACK 客户端发送FIN表示，没有数据要传输了，服务器端收到请求，发送ACK确认
客户端发送FIN到客户端请求关闭链接。客户端返回ACK进行确认。等待两个MSL时间段，仍然没有收到返回信息表示已正常关闭。

#### https与http
https需要CA证书的验证。https是运行在tcp上的ssl/tsl层的,所有信息都是加密的。http是运行在tcp层的，所有信息都是明文。 端口不一致，http80，https443。

#### JavaScript作用域
js作用域属于词法作用域。即在编译时就已经确定好代码的作用域范围。但是存在一些特殊的情况。
词法欺骗: wait(绑定一个对象，并以这个对象生成一个隔离的作用域),eval(其中的代码作用域存在于eval位置)
块级作用域: 存在一些特殊的块级作用域情况。wait()，生成隔离的作用域。try catch，生成块级作用域。es6的let const，作用域劫持，暂时性死区。

#### 跨域
a. jsonp 原理是script没有跨域问题,前后端需要规定返回的callback参数, 后端拼接字符串调用callback()，前端编写callback。
b. localstorage跨域,利用window.postmessage，使用B域存放数据，B域最好为主域，A域需要读写时通过postmessage向B域发送跨域信息。应该应用iframe.contentWindow.postMessage()

#### vue双向绑定
底层实现为object.defineProperty()设置setter与getter。分为observer(监听model并渲染到页面)，complier(将模板渲染为数据并设置监听),watcher(监听observer与complier,当更新时调用自身的update方法)。对于数组，vue重写了数组的push,pop等基础操作来实现双向绑定。

#### vuex状态管理
简单来说就是统一管理各个组件间的可变化状态。主要用于多个组件共享应用状态。主要包括state(数据),action（异步提交）,mutations(同步更新),getters(计算属性)。

#### localStroage,sessionStorage,cookie
l: 长久保存,5m,浏览器关闭不消失
s: 浏览器关闭清空,5m
c: 携带在http请求中,4k,通常数据需要加密，可以通过expires和ifModified字段设置

#### 虚拟DOM的diff算法
简单的diff算法可以理解为，设置旧与新状态的startNode与endNode，对新状态从startNode开始进行依次遍历，如果当前节点存在于旧节点，则标记节点。直至遍历结束，旧状态中没有被标记的节点则表示已经被删除，新状态中没有标记的节点则为新增节点。而很多时候我们只是需要变更文本而非DOM节点。

vue对diff算法做的优化是，当头部节点或者尾部节点相同时，可以认为其一致，不用移动DOM，直接进行复用。如果头尾一致，则目标明确，直接移动DOM。同时VUE会判断更新前后节点是否指向同类的节点。如果指向同类节点则直接复用DOM而不用进行移动。

#### http301与302
301为永久性转移,指网站已经不适用这个域名，转移到新的资源
302为暂时性转移，指暂时重定向到新域名

#### get与post的区别
- get的数据会显示在url中对所有人可见,post的数据不会显示在url，所以与post相比安全性能更差(规范其实都允许，只是某种程度进行约定)
- get只允许ascii字符，post没有限制
- GET后退按钮/刷新无害，POST数据会被重新提交
- GET编码类型application/x-www-form-url，POST编码类型encodedapplication/x-www-form-urlencoded 或 multipart/form-data。
- GET有数据长度的限制，POST无限制
- 本质上，GET只会发送一个数据包，POST会发送两个数据包。对于GET方式的请求，浏览器会把http header和data一并发送出去，服务器响应200（返回数据）。而对于POST，浏览器先发送header，服务器响应100 continue，浏览器再发送data，服务器响应200 ok（返回数据）。

#### 截取url
    /**
     * 获取url参数并输出obj对象
     **/
    getUrlObj(url){
        url = url || window.location.href;
        let reg = /[?&]([^=&#]+)=([^&#]*)/g;
        let obj = {};
        let results = url.match(reg);

        if (results) {
            for (let i in results) {
                let result = results[i].split("=");
                let key = result[0].substr(1);
                let value = result[1];
                obj[key] = obj[key] ? [].concat(obj[key], value) : value;
            }
        }
        return obj;
    }


#### js动态添加脚本
window.onload = {
    document.write(); 
 }

#### Js执行流程
 词法分析阶段 -> 语法分析阶段 -> 编译阶段(代码生成)
 JS引擎：从头到尾负责JavaScript的编译与执行过程
 编译器：负责语法生成与代码生成
 作用域： 负责收集并维护由所有声明的标志符(变量)组成的一系列查询，确定当前代码的访问权限

#### this
this是js提供的一种隐式的对象引用方式。this是在运行时进行绑定的，并不是在编译时绑定。其上下文取决于函数调用时的各种条件。根据情况this可以适配4种规则。
a. 默认情况 指向全局变量 在浏览器中指向window
b. 隐式引用 a.foo() 指向a
c. 显式引用 apply call
d. new 指向新创建对象

#### prototype
JavaScript对象中有一个特殊的[prototype]内置属性，其实是对于其他对象的引用。几乎所有的对象在创建时prototype都会赋予一个非空值。

当你尝试引用对象的属性时会触发[get]这个属性，第一步检查对象本身是否有这个属性，如果有就引用他。如果这个属性不在对象中，就使用对象的prototype链。这个过程会持续到找到匹配的属性名或者查找完整的prototype链。所有普通的prototype链都会最终指向内置Object.prototype。

#### rem
rem是相对于根节点font-size进行计算，所以根据屏幕的分辨率动态设置根节点的font-size属性。具体步骤为:
a. 设置viewport使得屏幕宽度等于设备宽度(可以根据移动端dpr值设置scala比例)
b. 将设计图平均分为10rem，根据比例计算出1rem在当前分辨率下的fontsize
c. 适配的地方使用rem

flexible实际上是js动态改写meta标签
a. 动态改写meta标签 android的dpr均判定为1,ios单独判断
b. 给html元素动态添加data-dpr属性
c. 给html元素添加font-size

#### 闭包
js中函数会创建一个内部的作用域，外部作用域无法访问内部作用于。闭包实际是提供一种访问内部函数作用域的方式。返回一个函数,函数能够引用内部作用域的值。创建闭包的条件包括：在外层保存访问内部函数的引用。封闭函数必须返回至少一个内部函数，这样内部函数才能在私有作用域中生成闭包，并且可以访问或者修改私有的状态。

缺点: 闭包会保留对内部函数的引用，这个引用是不会被清除的。过度使用闭包会造成性能的下降。

#### position
static: 默认值，根据文档流布局
relative: 根据元素在普通流的元素进行定位
position: 根据最近一级不是static的元素进行定位
fixed: 根据浏览器窗口进行定位

#### js垃圾回收
现在主要使用标记清除,当作用域上变量生成时，标记为‘进入环境’,当变量离开时标记为'离开环境'。垃圾回收器会在运行时给存储在内存上的变量加上标记。然后去掉环境中的变量以及闭包引用。其他部分删除。

在旧版本IE上使用引用计数。当引用值为0时，进行清除。

在IE中虽然JavaScript对象通过标记清除的方式进行垃圾回收，但BOM与DOM对象却是通过引用计数回收垃圾的， 
也就是说只要涉及BOM及DOM就会出现循环引用问题。

#### 前端性能优化
代码层面: 提高代码质量。css文件放在头部，js文件放在底部加载。避免使用css表达式而使用高级选择器。
缓存方面: 使用CDN加载静态资源。添加Expires头部。
请求数量: 合并样式与脚本文件。使用css sprite,首屏以外的图片按需加载(替换src),静态资源延时加载。
请求带宽: gzip，压缩文件

#### 栈与堆
栈: 先进后出，通常存储基本类型数据以及复杂类型数据的引用。由编译器自动分配释放。
堆: 树结构，通常存储复杂类型数据。由程序员手动释放或者程序结束时垃圾回收。

#### http2
- 服务端推送的概念，需要数据时主动推送。(比如请求一个index.html文件,会将其引用的css,js文件一并发送给客户端)
- 多路复用,允许一个连接同时传输多个消息
- HPACK对头部进行压缩(静态索引表,动态索引表,索引空间,哈弗曼编码)

#### defer与async
defer并行加载js文件，按照页面上script标签顺序执行
async并行加载js文件，下载完成立即执行

#### link与@import
@import是css提供的，仅仅可以加载css文件
link属于html标签，页面加载时会被同时加载。@import只会等其css文件加载完才会进行加载。
link方式权重高于@import方式权重

#### BFC
块级格式化上下文创建了一个独立布局的容器，容器不会影响外部元素的布局。此种容器可以容纳浮动元素。触发BFC的方式包括: overflow: hidden,display: table/inline-block,float除了none以外的值
- BFC会阻止外边距叠加 
- BFC不会重叠浮动元素 

#### !DOCTYPE
- <!DOCTYPE> 声明位于文档中的最前面，处于 <html> 标签之前。告知浏览器以何种模式来渲染文档。
- 严格模式的排版和JS运作模式是以该浏览器支持的最高标准运行。
- 在混杂模式中，页面以宽松的向后兼容的方式显示。模拟老式浏览器的行为以防止站点无法工作。
- DOCTYPE不存在或格式不正确会导致文档以混杂模式呈现。

#### 上下margin重合问题
IE与FF均存在。margin-top与margin-bottom发生重合的现象。

#### 页面到从url到显示发生了什么
- 浏览器新开一个线程，调用浏览器内部方法，根据url头部判断发起http请求
- 浏览器与服务器通过三次握手建立一个TCP/IP连接
- 浏览器发送GET请求，服务器通过HTTP响应返回资源
- 浏览器开始下载资源
- 浏览器解析HTML生成DOM树，解析CSS生成css Rules tree，javascript操作DOM进行改变。

#### 同源策略
域名，端口，协议相同。否则返回跨域错误。

#### 原生js实现ajax

```
var Ajax={
    get: function(url, fn) {
        var obj = new XMLHttpRequest();  // XMLHttpRequest对象用于在后台与服务器交换数据          
        obj.open('GET', url, true);
        obj.onreadystatechange = function() {
            if (obj.readyState == 4 && obj.status == 200 || obj.status == 304) { // readyState == 4说明请求已完成
                fn.call(this, obj.responseText);  //从服务器获得数据
            }
        };
        obj.send();
    },
    post: function (url, data, fn) {         // datat应为'a=a1&b=b1'这种字符串格式，在jq里如果data为对象会自动将对象转成这种字符串格式
        var obj = new XMLHttpRequest();
        obj.open("POST", url, true);
        obj.setRequestHeader("Content-type", "application/x-www-form-urlencoded");  // 添加http头，发送信息至服务器时内容编码类型
        obj.onreadystatechange = function() {
            if (obj.readyState == 4 && (obj.status == 200 || obj.status == 304)) {  // 304未修改
                fn.call(this, obj.responseText);
            }
        };
        obj.send(data);
    }
}
```

#### 页面编码和被请求的资源编码如果不一致如何处理？

    <script src=".." charset="gbk">
