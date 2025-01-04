import Vue from 'vue';
import { Store } from 'vuex';
import { AppState } from './store';
import { User } from './db/userDB';

export default class SkldrVue extends Vue {
  public declare $store: Store<AppState>;

  /**
   * Print a message to the console. Prefixes the message with the component
   * name.
   */
  protected log(message?: any, ...optionalParams: any[]): void {
    console.log(`[SK.${this.$options.name}]: `, message, ...optionalParams);
  }

  /**
   * Print an error message to the console. Prefixes the message with the
   * component name.
   *
   * @param message
   */
  protected error(message?: any, ...optionalParams: any[]): void {
    console.error(`[SK.${this.$options.name}]: `, message, ...optionalParams);
  }

  /**
   * Print a warning message to the console. Prefixes the message with the
   * component name.
   * @param message
   */
  protected warn(message?: any, ...optionalParams: any[]): void {
    console.warn(`[SK.${this.$options.name}]: `, message, ...optionalParams);
  }
}
