/**
 * Created by jiangmq on 2017/10/24.
 */
export default {
  lists: {
    type: [{
      name: 'Html&css',
      href: '/list/Html&css/typeContent',
    },{
      name: 'Vue',
      href: '/list/Vue/typeContent',
    },{
      name: 'Angular',
      href: '/list/Angular/typeContent',
    },{
      name: 'Http',
      href: '/list/Http/typeContent',
    },{
      name: 'Archive',
      href: '/list/Archive/typeContent',
    },{
      name: 'JavaScript',
      href: '/list/JavaScript/typeContent',
    }],
    content: [{
      id: 1,
      title: '基于Vue-cli的spa项目',
      catalog: ['前言', '配置', '项目开发', '配置到nginx', '学习方向与注意项'],
      year: '2017',
      month: '11',
      date: '16',
      type: 'Vue',
      href: '/Vue-Cli-Project',
      isKey: true,
    }, {
      id: 2,
      title: '移动端微信H5踩坑目录',
      catalog: ['适配', '布局', 'swiper', 'canvas', 'h5音频视频', '微信分享代码'],
      year: '2017',
      month: '12',
      date: '28',
      type: 'JavaScript',
      href: '/Geek-If-H5',
      isKey: true,
    },{
      id: 3,
      title: 'http2.0笔记',
      catalog: ['http基本优化','当前存在的问题','https','http2新特性','hpack'],
      year: '2018',
      month: '01',
      date: '10',
      type: 'Http',
      href: '/Http2',
      isKey: false,
    },{
      id: 4,
      title: 'Javascript学习',
      catalog: ['作用域','词法作用域','函数作用域与块作用域','作用域闭包','关于this','对象','混合对象类','原型'],
      year: '2018',
      month: '01',
      date: '16',
      type: 'JavaScript',
      href: '/js-study',
      isKey: true,
    },{
      id: 5,
      title: '面试碎片化知识归纳',
      catalog: [],
      year: '2018',
      month: '01',
      date: '27',
      type: 'others',
      href: '/interview',
      isKey: false,
    },{
      id: 6,
      title: '命令式编程与声明式编程',
      catalog: ['定义','栗子'],
      year: '2018',
      month: '03',
      date: '11',
      type: 'Archive',
      href: '/Imperative-Vs-Declarative',
      isKey: false,
    },{
      id: 7,
      title: 'EventLoop',
      catalog: ['任务分类','任务队列的调度算法','任务队列','事件循环','定时器','nodejs事件循环','例子','参考'],
      year: '2018',
      month: '03',
      date: '26',
      type: 'JavaScript',
      href: '/eventloop',
      isKey: false,
    },{
      id: 8,
      title: 'Nginx基础',
      catalog: ['概述','rewrite','代理','负载均衡','正则与匹配'],
      year: '2018',
      month: '04',
      date: '12',
      type: 'Archive',
      href: '/nginx',
      isKey: false,
    },{
      id: 9,
      title: 'TCP/IP',
      catalog: ['osi','tcp/ip基础','数据链路层','ip','传输层','路由协议','应用层协议','安全协议'],
      year: '2018',
      month: '05',
      date: '29',
      type: 'Archive',
      href: '/tcp-ip',
      isKey: true,
    }],

  },
  tools: [{
    id: 1,
    title: '表单转JSON对象',
    date: '2017-10-19',
    description: '提供JSON对象转化为表单的方法，传入参数(class,obj)',
    href: '/toolTemplate',
    type: 1,
  }, {
    id: 2,
    title: 'Vue排序表格',
    date: '2017-11-30',
    description: '提供基于Vue的排序表格的两种实现',
    href: '/sortTable',
    type: 1,
  }],
  bookLists: [{
    title: 'CSS权威指南',
    isRead: true,
  }, {
    title: 'Vue权威指南',
    isRead: true,
  }, {
    title: 'ES6权威指南',
    isRead: true,
  }, {
    title: 'CSS世界',
    isRead: false,
  },{
    title: '你不知道的JavaScript（上）',
    isRead: true,
  },{
    title: '你不知道的JavaScript（中）',
    isRead: false,
  },{
    title: 'Nginx高性能Web服务器详解',
    isRead: true,
  },{
    title: '移动端web开发',
    isRead: true,
  },{
    title: '图解TCP/IP',
    isRead: true
  }],
  collects: [
    [
      {
        title: '移动端web',
        content: 'pwa',
        author: '4月',
      },
    ],
    [
      {
        title: 'promise',
        content: 'promise异步编程',
        author: '4月'
      }
    ],
    [],
    [],
  ],
};
