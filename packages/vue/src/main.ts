import '@babel/polyfill';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import Vue from 'vue';
import App from './App.vue';
import vuetify from './plugins/vuetify'; // Only import once
import './registerServiceWorker';
import router from './router';
import store from './store';
import Vuex from 'vuex';
import 'vuetify/dist/vuetify.min.css';

Vue.config.productionTip = false;

// Ensure Vue uses Vuex before creating the app instance
Vue.use(Vuex);

new Vue({
  router,
  store,
  vuetify, // Add the vuetify instance here
  render: (h) => h(App),
}).$mount('#app');
