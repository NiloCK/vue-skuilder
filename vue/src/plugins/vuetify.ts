import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import colors from 'vuetify/es5/util/colors';

// const theme = {
//   primary: colors.indigo.base,
//   secondary: colors.teal.base,
//   accent: colors.cyan.base,
//   error: colors.red.base,
//   warning: colors.amber.base,
//   info: colors.blue.base,
//   success: colors.green.base
// }

// const coolers = {

//   primary: "#0e7c7b",
//   secondary: "#ee6055",
//   accent: "#93e5ab",
//   error: "#053c5e",
//   warning: "#656565",
// }

Vue.use(Vuetify, {
  iconfont: 'md'
  // theme: coolers
});
