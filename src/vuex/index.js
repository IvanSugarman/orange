import Vue from 'vue';
import Vuex from 'vuex';

import state from '@/vuex/state';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
Vue.config.debug = debug;

export default new Vuex.Store({
  state,
  getters: {
    getList: state => state.list,
    getBook: state => state.book,
  },
  strict: debug,
});
