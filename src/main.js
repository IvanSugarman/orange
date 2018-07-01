// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from '@/router/index.js'
import vuex from 'vuex'

import Highlight from '@/assets/vendor/HighLight.js'
import store from './vuex/index';
import Anchor from './components/anchor'

Vue.use(Highlight);
Vue.component('anchor', Anchor);
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App, Anchor},
  template: '<App/>'
})
