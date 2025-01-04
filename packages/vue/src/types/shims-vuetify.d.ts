import { Store } from 'vuex';
import { AppState } from '../store';

declare module 'vuetify/lib' {
  import Vuetify from 'vuetify';
  export default Vuetify;
}

declare module 'vuetify/types' {
  import { Vue } from 'vue-property-decorator';
  interface Vue {
    $vuetify: any;
    $store: Store<AppState>;
  }
}
