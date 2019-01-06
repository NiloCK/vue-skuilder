import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const GuestUsername: string = 'Guest';

export interface AppState {
  user: string;
}

export default new Vuex.Store<AppState>({
  state: {
    user: GuestUsername
  },
  mutations: {

  },
  actions: {

  }
});
