import Vue from 'vue';
import App from './App.vue';
import router from './router.ts';
import store from './store.ts';
import './registerServiceWorker.ts';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
