import Vue from 'vue'
import Router from 'vue-router'
import Index from '@/page/views/index'

Vue.use(Router)

function route__format(route) {
  return Object.keys(route).map((index) => {
    const {type, title, children} = route[index];

    if (!!children && children.length) {
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
    path: '/index',
    component: Index,
    children: [{
      title: 'shell-script',
      type: 'md',
    }],
  },
  {
    path: '',
    name: 'hello',
    component: resolve => require(['@/components/HelloWorld.vue'], resolve)
  }
];

console.log(route__format(route));

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
