import Vue from 'vue';
import Vuex from 'vuex';

import state from '@/vuex/state';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';
Vue.config.debug = debug;

export default new Vuex.Store({
  state,
  strict: debug,
});
