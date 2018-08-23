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
    getRTools(state) {
        const result = [];
        state.tools.forEach(item => {
            result.push(item);
        });
    },
    getArticle: state => title => {
      let result = {};

      state.list.forEach(item => {
         if (title == item.href) {
           result = item;
         }
      });

      return result;
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
