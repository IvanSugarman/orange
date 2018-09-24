import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/views/index'
import List from '@/page/views/list'
import Book from '@/page/views/book'
import Article from '@/page/views/article'
import Tools from '@/page/views/tools'

Vue.use(Router)

function route__format(route) {
  return Object.keys(route).map((index) => {
    const {type, title, children} = route[index];

    if (children && children.length) {
       route[index].children = route__format(children);
    }

    if (type === 'md') {
      return {
        path: title,
        name: title,
        component: resolve => require(['@md/' + title + '.md'], resolve),
      }
    } else {
      return route[index];
    }

  });
}

const articles = [{
  title: 'shell-script',
  type: 'md',
},{
  title: 'vue-cli-spa',
  type: 'md',
},{
  title: 'Geek-If-H5',
  type: 'md',
},{
  title: 'http2',
  type: 'md',
},{
  title: 'js-study-domain',
  type: 'md',
},{
  title: 'js-study-this',
  type: 'md',
},{
  title: 'js-study-object',
  type: 'md',
},{
  title: 'js-study-prototype',
  type: 'md',
},{
  title: 'interview',
  type: 'md',
},{
  title: 'Imperative-Vs-Declarative',
  type: 'md',
},{
  title: 'eventloop',
  type: 'md',
},{
  title: 'nginx',
  type: 'md',
},{
  title: 'tcp-ip',
  type: 'md',
},{
  title: 'linux-user',
  type: 'md',
},{
  title: 'pwa-service-worker',
  type: 'md',
},{
  title: 'linux-file',
  type: 'md',
},{
  title: 'git-rebase',
  type: 'md',
},{
  title: 'fetch',
  type: 'md',
},{
  title: 'js-study-async',
  type: 'md',
},{
  title: 'life-of-a-pixel',
  type: 'md',
}];

const tools = [{
  title: 'taskbook',
  type: 'md',
}];

const route = [
  {
    path: '/',
    name: 'index',
    component: Index,
  },
  {
    path: '/list',
    name: 'list',
    component: List,
  },
  {
    path: '/book',
    name: 'book',
    component: Book,
  },
  {
    path: '/tools',
    name: 'tools',
    component: Tools,
  },
  {
    path: '/article',
    name: 'article',
    component: Article,
    children: articles.concat(tools),
  }
];

export default new Router({
  mode: 'history',
  routes: route__format(route),
  scrollBehavior(to) {
    if (to.hash) {
      return {
        selector: to.hash,
      };
    }
  },
})
