## 概述
fetch API提供js接口用来访问和操纵http管道部分。如请求与响应，也提供了一个全局用`fetch()`方法。

#### 与jquery.ajax的差异
- 收到代表错误的http状态码，从`fetch()`返回的Promise也**不会标记为reject**，即使是404或者500，会被Promise标记为resolve(`ok`属性设置为false)，只有**网络故障**或**请求被阻止**，才会标记reject。
- 默认情况下, **`fetch`不会从服务端发送或者接收任何cookie**

## fetch请求

#### 简单请求
简单的请求一个json，其用法是只提供一个参数用来指明想`fetch()`到的资源路径，然后返回一个包含结果的promise。
> 为了获取JSON的内容，需要使用`json()`方法

```js
fetch('http://example.com/movies.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(myJson);
  });
```

#### 配置对象 
`fetch()`支持第二个可选参数，一个控制不同配置的`init`对象。
```js
postData('http://example.com/answer', {answer: 42})
  .then(data => console.log(data))
  .catch(error => console.error(error))

function postData(url, data) {
  return fetch(url, {
    body: JSON.stringify(data), // must match 'Content-Type' header
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, same-origin, *omit
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'no-referrer', // *client, no-referrer
  }).then(response => response.json()) // parses response to JSON
}
```

#### 自定义请求对象
通过`Request()`构造函数创建一个request对象，再作为参数传给`fetch()`
```js
var myHeaders = new Headers();

var myInit = { method: 'GET',
               headers: myHeaders,
               mode: 'cors',
               cache: 'default' };

var myRequest = new Request('flowers.jpg', myInit);

fetch(myRequest).then(function(response) {
  return response.blob();
}).then(function(myBlob) {
  var objectURL = URL.createObjectURL(myBlob);
  myImage.src = objectURL;
});
```
可以传入一个已经存在的request对象作为拷贝。
```js
var anotherRequest = new Request(myRequest,myInit);
```
因为request对象只能使用一次。可以通过复制的方式快速拷贝。
> Request与Response被设计为stream的形式

#### 发送带凭据的请求
根据credentials属性来确定请求是否携带凭据以及域的范围。
- include: 发送包含凭据的请求(即使跨域源)
- same-origin: 同源
- omit: 不包含凭据

#### 上传JSON数据

```js
var url = 'https://example.com/profile';
var data = {username: 'example'};

fetch(url, {
  method: 'POST', // or 'PUT'
  body: JSON.stringify(data), // data can be `string` or {object}!
  headers: new Headers({
    'Content-Type': 'application/json'
  })
}).then(res => res.json())
.catch(error => console.error('Error:', error))
.then(response => console.log('Success:', response));
```

#### 检测请求是否成功
判断请求成功的要素在于只有网络故障等情况下fetch的promise才会reject并带上一个TypeError对象。所以在404情况下要判断是否情况则应该在resolved情况下再判断`Response.ok`是否为true
```
fetch('flowers.jpg').then(function(response) {
  if(response.ok) {
    return response.blob();
  }
  throw new Error('Network response was not ok.');
}).then(function(myBlob) { 
  var objectURL = URL.createObjectURL(myBlob); 
  myImage.src = objectURL; 
}).catch(function(error) {
  console.log('There has been a problem with your fetch operation: ', error.message);
});
```

## Headers
可以通过Headers构造函数创建自己的headers对象。可以通过以下方式构造
```js
var content = "Hello World";
var myHeaders = new Headers();

// append
myHeaders.append("Content-Type", "text/plain");
myHeaders.append("Content-Length", content.length.toString());
myHeaders.append("X-Custom-Header", "ProcessThisImmediately");

// new
myHeaders = new Headers({
  "Content-Type": "text/plain",
  "Content-Length": content.length.toString(),
  "X-Custom-Header": "ProcessThisImmediately",
});
```

#### 内容可获取
Headers的内容可以通过暴露的接口方法获取。但是有一些操作所只能在`ServiceWorkers`中使用。存在两种抛出TypeError异常的途径, 除此之外失败并不抛异常。
- 使用了不合法的HTTP Header属性名
- 写入了一个不可写的属性
```
console.log(myHeaders.has('Content-Type'));

myHeaders.set("Content-Type", "text/html");

myHeaders.append("X-Custom-Header", "AnotherValue");

myHeaders.get("Content-Length");

myHeaders.getAll("X-Custom-Header");

myHeaders.delete("X-Custom-Header");
```

#### guard
Headers可以在request请求中被接受，并且规定哪些参数可写。Headers存在一个特殊的guard属性。这个属性影响的内容可以在Headers对象中被操作。
- none: 默认
- request: 从request中获得的headers只读
- request-no-cors: 从不同域(Request.mode `no-cors`)的request中获得的headers只读
- response: 从response中获得的headers只读
- immutable: 在ServiceWorkers中常用，所有header只读

## Response对象
`Response`实例是在fetch()处理完promises之后返回的。其实例可以通过js创建，但是只有在`ServiceWorkers`才有用。当使用`respondWith()`方法并提供一个自定义的response接受request时：
```js
var myBody = new Blob();

addEventListener('fetch', function(event) {
  event.respondWith(new Response(myBody, {
    headers: { "Content-Type" : "text/plain" }
  });
});
```
response的构造方法接受两个参数
- response数据体
- 一个初始化对象

常见的Response属性包括
- Response.status
- Response.statusText
- Response.ok

## Body
不管是请求还是响应都包含body对象，body可以是以下任意类型实例
- ArrayBuffer
- ArrayBufferView
- Blob/File
- String
- URLSearchParams
- FormData

Body类定义了以下方法(均被response和request实现)以获取body内容。**这些方法都会返回一个被解析后的promise对象和数据**。相比于XHR，这些方法让非文本化数据使用起来简单。
- arrayBuffer()
- blob()
- json()
- text()
- formData()

同时request和response(包括fetch)都会试着自动设置`Content-Type`。

## 兼容性检测
可以通过检测`Headers`, `Request`, `Response`或者`fetch()`是否在`Window`或者`Worder`的域中
```$
	if (self.fetch) {
		// run fetch request
	} else {
		// something with xhr
	}
```
