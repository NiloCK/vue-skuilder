import Vue from 'vue';
import { Store } from 'vuex';
import { AppState } from '@/store';

export default class SkldrVue extends Vue {
  public $store: Store<AppState>;

  /**
   * Print a message to the console. Prefixes the message with the component
   * name.
   * @param message
   */
  protected log(message: string): void {
    console.log(`[SK.${this.$options.name}]: ${message}`);
  }

  /**
   * Print an error message to the console. Prefixes the message with the
   * component name.
   * @param message 
   */
  protected error(message: string): void {
    console.error(`[SK.${this.$options.name}]: ${message}`);
  }
}
