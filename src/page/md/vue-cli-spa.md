基于VueCli搭建单页应用个人博客网站。
- 项目框架: Vue
- 辅助框架: Vuex Vue-router Echarts

#### 项目结构
- assets
  - css
  - fonts
  - img
- components
- router
- vuex
  - actions.js(异步操作提交mutation)
  - index.js(入口文件与getter)
  - mutations.js(修改状态)
  - state.js(单一状态树)
- app.vue(页面入口文件)
- main.js(程序入口文件，加载公共组件)

## 配置
#### vue-cli
```
npm install -g vue-cli
vue init webpack project-name
npm install
npm run dev
```
#### sass
vue-cli中默认配置好了sass，只需要下载下面两个模块。

```
npm install node-sass --save-dev
npm install sass-loader --save-dev
```
#### vuex

```
npm install vuex --save
```

#### echarts

```
npm install echarts -S
```
或者引入淘宝镜像

```
npm install -g cnpm --registry=https://registry.npm.taobao.org
```
全局引入方式

```
// 引入echarts
import echarts from 'echarts'

Vue.prototype.$echarts = echarts 
```


## 项目开发
#### 声明周期钩子
使用场景：使用document根据浏览器高度设置组件高度

知识点：

- beforeCreated：在实例初始化之后,数据观测 (data observer) 和 event/watcher 事件配置之前。此时$el、data 的值都为undefined。++loading事件在此添加++
- created：实例创建完成。完成数据观测、属性方法运算、watch/event事件回调。挂载未开始，data值已创建，但$el不可见。++做一些初始化，实现函数自执行。++
- beforeMounted: 挂载开始之前，相关render首次被调用。$el的值为“虚拟”的元素节点。
- mounted: el 被新创建的 vm.$el 替换并挂载实例。DOM渲染已被完成。++可以发起axios请求拿到数据并配合路由钩子做一些事情。设置动态高度也在此进行。++

#### 关于ESLint遍历问题
在ESLint的推荐标准中，遍历对象可以使用如下方法。

```
Object.values(obj).forEach((value) => {})
```

关闭一些个人不喜欢的设置
```
// allow console
"no-console": "off",
// allow shadow
"no-shadow": "off",
// allow +
'prefer-template': 'off',
// no return
'consistent-return': 'off',
```

#### Vue
1. 数据中包含HTML元素时,在需要的元素上使用v-html="data"
2. 在需要引入第三方非Npm模块文件时，可以使用在需要页面中直接引入js文件。但是个人认为，vue与webpack理念均为推行模块化，故尽量不采取此种方式。
3. 引入JQuery模块可以使用vendor.js的方法包装Jquery。此方法只依赖于自己，不需要其他插件或者加载器

Jquery-vendor.js:

```
import $ from 'jquery';
window.$ = $
window.jQuery = $
export default $
```
此后引用jq时指向Jquery-vendor.js

```
import $ from '../assets/jquery-vendor.js'
import 'jquery-ui'
```
为了调用方便，可在webpack配置文件中创建jquery-vendor.js的别名

```
alias: {
    jquery: 'src/assets/jquery-vendor.js' //    将其指向jquery-vendor.js所在位置
} 
```
4. 公共组件的复用

以该项目头部为例

src/components/header.vue:

```
<template>
  <header>
    <router-link to="/index">
      <div class="logo">
        TheOrange
      </div>
    </router-link>
    <ul>
      <!--属性通过['prop']引入-->
      <router-link v-for="list in headerList" :to="list.href" :key="list.id">
        <li :class="{'active': (list.id == activeTab)}">
          {{list.title}}
        </li>
      </router-link>
    </ul>
  </header>
</template>
```
src/main.js

```
import ContentHeader from '@/components/header';

Vue.component('content-header', ContentHeader);

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App, ContentHeader },
});
```
调用：

```
<content-header active="3"></content-header>
```




#### Vue-router
1. 当需要使用a标签作为锚点行为时，需要在router/index.js中设置如下滚动行为

```
scrollBehavior(to) {   if (to.hash) {     return {       selector: to.hash,     };   } },
```

2. 嵌套路由
URL 中各段动态路径也按某种结构对应嵌套的各层组件，适合于做左侧目录，右侧内容的布局。

/src/router/index.js：

```
    {
      path: '/list/:type',
      component: List,
      children: [{
        path: '',
        component: Types,
      }, {
        path: 'typeContent',
        component: TypesContent,
      }],
    },
```
/src/components/typesContent.vue

通过this.$route.params.type获取路由数据

```
    data() {
      return {
        ListByType: this.$store.getters.getListsByType(this.$route.params.type),
      };
    },
```

3. 页面懒加载
为了优化首屏加载速度，可以采用懒加载的方式根据需求加载文件。

官网给出的例子如下
 
    const Tools = () => {import '@/components/tools.vue'};
该方法使用了webpack2中的动态import来返回Promise，当使用Babel时需要安装SyntaxDynamicImport插件。

    npm install --save-dev babel-plugin-syntax-dynamic-import

import()方法为了避免编译错误现在仍处于第三阶段，需要等待其完全加入细则。另一种配合webpack的异步加载方法如下：

    resolve => require([URL], resolve)





#### Vuex
当需要给getters对象进行传参时，可以通过返回函数的形式达到目的。

```
  // 根据分类获取列表
    getListsByType: state => (type) => {
      const result = {
        type,
        content: [],
      };

      state.lists.content.forEach((val) => {
        if (val.type === type) {
          result.content.push(val);
        }
      });

      return result;
    },
```

## 配置到Nginx
服务器环境： Linux

发行版本： Centos7.0

平台: 阿里云

#### 安装Nginx

```
命令：yum install nginx
默认配置地址：/etc/nginx/nginx.conf
配置引用地址：/etc/nginx/conf.d/*.conf
```

#### Nginx启动、重启、关闭
- 启动：/bin/systemctl start nginx.service
- 重启：nginx -s reload
- 关闭：nginx -s quit
- 查看Nginx进程：ps -ef | grep nginx

#### 查找Nginxi错误日志
通过nginx.conf找到错误日志的存储格式以及存储位置。分为error.log与access.log

寻找文件：
    
    find / -name nginx.conf  
    
打开Nginx.conf：
    
    vi /etc/nginx/nginx.conf
    
查找错误文件:

```
vi /var/log/nginx/access.log

vi /var/logdata/nginx/error.log 
```





#### 配置nginx

```
    # 静态文件
    location ~* .(js) {
        root      /usr/share/nginx/html/orange;
        try_files $uri /bundle.js;
    }

    # 默认首页
    location / {
        root /usr/share/nginx/html/orange;
        try_files $uri $uri/ /index.html;
    }
```


## 学习方向与注意项
1. Vuex状态管理:action,mutation
2. Vue-router过渡动效
3. Vue VitualDom生成过程
4. 通用组件复用!!!!
