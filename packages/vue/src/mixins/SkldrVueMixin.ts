import Vue from 'vue';
import { Store } from 'vuex';
import { AppState } from '../store';
import { User } from '../db/userDB';

export default Vue.extend({
  methods: {
    log(message?: any, ...optionalParams: any[]): void {
      console.log(`[SK.${this.$options.name}]: `, message, ...optionalParams);
    },

    error(message?: any, ...optionalParams: any[]): void {
      console.error(`[SK.${this.$options.name}]: `, message, ...optionalParams);
    },

    warn(message?: any, ...optionalParams: any[]): void {
      console.warn(`[SK.${this.$options.name}]: `, message, ...optionalParams);
    },

    user(): User {
      if (!(this.$store as Store<AppState>).state._user) {
        throw new Error('User not logged in');
      } else {
        return (this.$store as Store<AppState>).state._user!;
      }
    },
  },
});

export interface ISkldrMixin {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
  user(): User;
}
