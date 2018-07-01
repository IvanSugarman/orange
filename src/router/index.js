import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/views/index'
import List from '@/page/views/list'
import Article from '@/page/views/article'

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
    path: '/article',
    name: 'article',
    component: Article,
    children: [{
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
      title: 'js-study',
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
    }],
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
