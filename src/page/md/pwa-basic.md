
## Pwa前端架构方式
- 应用外壳架构
    UI外壳应该被瞬时加载。使用Service Worker缓存，可以缓存网站的UI外壳以便用户重复访问。而其他内容动态加载。
- 性能优势与缓存
    当用户首次访问网站时，Service Worker开始下载并自行安装。安装阶段可以进入事件并且准备缓存UI外壳所有资源(html与需要的css或js)。缓存之后这些资源的http请求不需发送到服务器，一旦用户导航到另一个页面，可以检查资源是否已经存在在缓存中，如果不存在再通过网络检索。如果存在，他们将立刻看到外壳。
- 例子
    twitter PWA使用Service Worker来缓存它们的emoji表情。一旦拦截到匹配路由规则的任意http请求，就会存在名为twemoji的缓存中。下次呈现请求时，呈现的是缓存的结果。
    ```javascript
    // 拦截所有路径为/emoji/v2/svg/:icon的请求
    toolbox.router.get('/emoji/v2/svg/:icon', function(event) {
        // 打开一个叫twemoji的已经存在的缓存
        return caches.open('twemoji').then(function(response) {
            // 检查当前请求是否匹配缓存中的内容
            return response.match(event.request).then(function(response) {
                // 如果匹配立即返回缓存，否则按照一般方式运行
                return response || fetch(event.request)
            });
        }).catch(function() {
            // 如果打开缓存出现问题，继续按照一般方式运行
            return fetch(event.request);
        })
    }, {
        // 只检查twimg.com域名下的资源
        origin: /abs.*\.twimg\.com$/
    });
    ```
    在离线浏览的情况下，可以使用Service Worker缓存构建独特的离线页面甚至整个网页。如果用户没有网络连接，Twitter Lite会为用户呈现一个自定义的离线页面。
