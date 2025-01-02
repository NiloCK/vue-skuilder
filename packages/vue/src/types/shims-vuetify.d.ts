declare module 'vuetify/lib' {
  import Vuetify from 'vuetify';
  export default Vuetify;
}

declare module 'vuetify/types' {
  import { Vue } from 'vue-property-decorator';
  interface Vue {
    $vuetify: any;
  }
}
