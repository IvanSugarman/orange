## Service Worker

#### 基础

Service Worker可以让你全权控制网站发起的每一个请求，其行为方式可以重定向请求甚至彻底停止。虽然Service Worker是使用JavaScript编写的，但是与标准JavaScript有所不同。有如下几个特点
- 运行在它自己的全局脚本上下文
- 不绑定到具体的网页
- 无法修改网页中的元素，因为其无法访问DOM
- 只能使用HTTPS

其表现为**主浏览器线程 => Service Worker线程 => 服务器**

Service Worker运行在worker上下文中，与应用的主要JavaScript运行在不同线程中，所以其不会被阻塞。而他是完全异步的，所以无法使用同步XHR和localstorage之类的功能