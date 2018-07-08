## Service Worker

#### 基础

Service Worker可以让你全权控制网站发起的每一个请求，其行为方式可以重定向请求甚至彻底停止。虽然Service Worker是使用JavaScript编写的，但是与标准JavaScript有所不同。有如下几个特点
- 运行在它自己的全局脚本上下文
- 不绑定到具体的网页
- 无法修改网页中的元素，因为其无法访问DOM
- **只能使用HTTPS**

其表现为**主浏览器线程 => Service Worker线程 => 服务器**

Service Worker运行在worker上下文中，与应用的主要JavaScript运行在不同线程中，所以其不会被阻塞。而他是完全异步的，所以无法使用同步XHR和localstorage之类的功能

#### 生命周期
1. 用户导航到URL
    注册过程中调用register()函数, Service Worker开始下载。

    ```javascript
    if ('serviceWorker' in navigator) {
        // register返回promise
        navigator.serviceWorker
                 .register('/sw.js')
                 .then(function (registeration) {
                    // 注册成功
                 }).catch(function (err) {
                    // 注册失败
                 });
    }
    ```
2. 注册过程中浏览器下载、解析和执行Service Worker
    在步骤中出现错误, register()放回的Promise会执行reject操作，同时Service Worker会被废弃。Service Worker**基于事件**, 可以进入事件的钩子。
3. Service Worker执行，激活安装事件
4. Service Worker控制客户端并处理功能事件
    Service Worker通过事件驱动的，允许通过不同事件监听任何网络请求。fetch是其中一个关键事件，当一个资源发起fetch事件时，可以决定如何继续进行。也可以将发出的HTTP请求或接受的HTTP响应更改成任何内容。

    ```javascript
    // 为fetch添加事件监听
    self.addEventListener('fetch', function(event) {
        // 匹配http请求url是否以jpg结尾文件
        if (/\.jpg$/.test(event.request.url)) {
            // 获取unicorn图片并做为替代图片响应请求
            event.respondWith(fetch('/images/unicorn.jpg'));
        }
    });
    ```

    ## 缓存

    #### http缓存
    当浏览器发起一个资源请求时，服务器返回的资源附带http响应头。这些响应头包含有用的信息，浏览器通过其了解与资源有关的相关信息。包括类型，缓存时间，是否压缩过等。但是其缺陷在于，使用http缓存意味着要依赖服务器来告知何时缓存资源以及资源何时过期。内容具有相关性的话更新可能导致服务器发送的到期日期变得不容易同步。

    #### Service worker缓存
    其优势在于**无需服务器告知浏览器资源缓存多久。**可以通过编写逻辑来决定想要缓存的资源，满足条件以及资源缓存多久。如下是启动一个Service Worker后service-worker.js的内容

    ##### install
    ```javascript
    // 缓存名称
    var cacheName = 'helloworld';

    // Service Worker安装事件
    self.addEventListener('install', event => {
        // 指定的缓存名称打开缓存
        event.waitUtil(
            // 把js和图片文件添加到缓存
            caches.open(cacheName).then(cache => cache.addAll([
                '/js/script.js',
                '/images/hello.png'
            ]))
        );
    });
    ```
    在Service Worker的install事件中，这是把后面阶段可能用到的资源添加到缓存的绝佳事件。如果知道之后会一直使用某个js文件，就可以在此缓存。在之后其他引用此js文件的页面可以轻松从缓存中获取文件。对于缓存名称变量，可以拥有一个缓存的多个不同的副本。`cache.addAll()`传入文件数组`event.waitUntil`方法使用promise来知晓安装时间和是否成功。**如果有任何文件下载失败，安装过程随之失败，定义一个很长的文件列表会增加缓存失败的概率。**

    ##### fetch
    缓存准备好之后，我们需要从中读取资源。让Service Worker开始监听fetch事件
    ```javascript
    // 添加fetch监听
    self.addEventListener('fetch', function (event) {
        // 检查传入URL是否匹配缓存中内容
        event.respondWith(
            caches.match(event.request).then(function (response) {
                // 如果有response并且不是未定义，返回
                if (response) {
                    return response;
                }
                // 否则如往常一样通过网络获取预期资源
                return fetch(event.request);
            })
        )
    });
    ```
    首先通过fetch事件增加一个监听器，之后通过`caches.match()`检查传入url是否匹配内容。匹配则返回，否则通过网络获取。通过**chrome中的appliacation**可以清晰查看到缓存内容。

    ##### 拦截并缓存
    如果资源可能是动态的，在Service worker安装期间是不可知的。因为Service Worker能够拦截到http请你求，所以是发起请求并将其相应存储在缓存中的绝佳机会。将首先请求资源，然后立即将其缓存，对于同样资源的下一次HTTP请求，可以立即从缓存中取出。
    ```javascript
    // 缓存名称
    var cacheName = 'helloworld';

     self.addEventListener('fetch', function (event) {
        // 当前请求是否匹配缓存中的任何内容
        event.respondWith(
            caches.match(event.request).then(function (response) {
                // 如果有response并且不是未定义，返回
                if (response) {
                    return response;
                }
                
                // 复制请求，请求是一个流，只能使用一次
                var requestToCache = event.request.clone();

                return fetch(requestToCache).then(
                    function () {
                        // 如果请求失败或者错误代码，立刻返回错误消息
                        if (!response || response.status !== 200) {
                            return response; 
                        }

                        // 再一次复制响应，需要将其添加到缓存中，还将用于最终返回响应
                        var responseToCache = response.clone();

                        // 打开helloworld缓存
                        caches.open(cacheName).then(function (cache) {
                            // 响应添加到缓存中
                            caches.put(requestToCache, responseToCache);
                        });

                        return response; 
                    });
            })
        )
    });
    ```
    需要注意的是，在代码进一步执行之前，需要复制请求，请求是一个流，只能使用一次。此时已经通过缓存使用了一次请求，接下来发起http请求还需要使用一次。所以需要在此时复制请求。如果成功响应，会再次复制响应，响应同样是一个流，因为想要浏览器和缓存都能够使用响应，所以需要两个流。最后在代码中会用这个响应并且添加至缓存中，如果刷新页面或者访问另一个请求资源的页面，会立即从缓存中获取。这样，每次返回成功的http响应时，都能动态的向缓存中添加资源。

#### 版本控制
Service Worker需要一个更新的时间点。这样保证用户接受到的是新版本的文件。Service Worker的优点在于，**每当对Service Worker文件本身做出更改时，都将自动触发Service Worker的更新流程。**更新缓存时，可以使用两种方式
- 更改存储缓存的名称
- 对文件进行版本控制

#### 额外查询参数
当Service Worker检查已缓存的响应时，使用请求URL作为键。**默认情况下请求URL必须与用于存储已缓存响应的URL完全匹配，包括URL查询部分的任何字符串。**如果对文件发起的http请求附带的任意查询字符串，可能导致一些问题。可以通过ignoreSearch属性设置为true来忽略查询字符串。
```javascript
self.addEventListener('fetch', function (event) {
        event.respondWith(
            caches.match(event.request, {
                ignoreSeach: true,
                // ignoreMethod: 会忽略请求参数方法 POST/GET
                ignoreMethod: true,
                // ignoreVary: 忽略已缓存响应中的vary响应头
                ignoreVary: true,
            }).then(function (response) {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
        )
    });
```

#### workbox
http://workboxjs.org/, 辅助库，快速开始创建自己的Service Worker，其中内置的处理程序能够涵盖最常见的网络策略。

