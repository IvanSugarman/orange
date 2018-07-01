import Vue from 'vue';
import Vuex from 'vuex';

import state from '@/vuex/state';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
Vue.config.debug = debug;

export default new Vuex.Store({
  state,
  getters: {
    getRList(state) {
      const result = [];
      state.list.forEach(item => {
        result.push(item);
      });

      return result.reverse();
    },
    getBook: state => state.book,
  },
  mutations: {
    reverse(list) {
      return list.reverse();
    }
  },
  strict: debug,
});
