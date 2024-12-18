import '@babel/polyfill';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import Vue from 'vue';
import App from './App.vue';
import './plugins/vuetify';
import './registerServiceWorker';
import router from './router';
import store from './store';
import SkldrVue from './SkldrVue';
import Vuex from 'vuex';

Vue.config.productionTip = false;

// Ensure Vue uses Vuex before creating the app instance
Vue.use(Vuex);

new SkldrVue({
  router,
  store,
  render: h => h(App),
}).$mount('#app');
