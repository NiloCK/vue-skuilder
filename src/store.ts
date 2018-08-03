import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export interface AppState {
  user: string;
}

export default new Vuex.Store<AppState>({
  state: {
    user: 'Guest'
  },
  mutations: {

  },
  actions: {

  }
});
