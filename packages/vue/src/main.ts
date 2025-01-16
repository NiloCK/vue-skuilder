// import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import { createApp } from 'vue';
import App from './App.vue';
// import vuetify from './plugins/vuetify'; // Only import once
import './registerServiceWorker';
import router from './router';
import { createPinia, PiniaVuePlugin } from 'pinia';
import vuetify from './plugins/vuetify';

// Vue.config.productionTip = false;

// Vue.use(PiniaVuePlugin);

// // Ensure Vue uses Vuex before creating the app instance
// // Vue.use(Vuex);

// new Vue({
//   router,
//   pinia,
//   vuetify,
//   render: (h) => h(App),
// }).$mount('#app');

const pinia = createPinia();
const app = createApp(App);

app.use(router);
app.use(vuetify);
app.use(pinia);
app.mount('#app');
