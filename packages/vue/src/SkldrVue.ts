import Vue from 'vue';
import { Store } from 'vuex';
import { AppState } from '@/store';
import { User } from './db/userDB';

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

  /**
   * Get the current user from the Vuex store. Throws an error if the user is
   * not logged in
   */
  protected user(): User {
    if (!this.$store.state._user) {
      throw new Error('User not logged in');
    } else {
      return this.$store.state._user;
    }
  }
}
