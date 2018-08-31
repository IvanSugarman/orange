import Vue from 'vue';
import Vuex from 'vuex';

import state from '@/vuex/state';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
Vue.config.debug = debug;

const PAGENUM = 15;

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
    getRListByPage: state => pageNum => {
      const result = [];
      let max;
      let min;

      max = pageNum * PAGENUM;
      min = (pageNum - 1) * PAGENUM;

      for (; min < max; min++) {
        if (state.list[min]) {
          result.push(state.list[min]);
        } else {
          return result.reverse();
        }
      }

      return result.reverse();
    },
    getTotalPage(state) {
      return Math.floor(state.list.length / PAGENUM) + 1;
    },
    getRTools(state) {
        const result = [];
        state.tools.forEach(item => {
            result.push(item);
        });

        return result.reverse();
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
