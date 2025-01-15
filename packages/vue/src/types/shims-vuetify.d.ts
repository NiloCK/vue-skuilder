import { Store } from 'vuex';
import { AppState } from '../store';

declare module 'vuetify/lib' {
  import Vuetify from 'vuetify';
  export default Vuetify;
}

declare module 'vuetify/types' {
  import Vue from 'vue';
  interface Vue {
    $vuetify: any;
  }
}
