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

Vue.config.productionTip = false;

new SkldrVue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
