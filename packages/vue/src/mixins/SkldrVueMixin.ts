import Vue from 'vue';
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
  },
});

export interface ISkldrMixin {
  log(message?: any, ...optionalParams: any[]): void;
  error(message?: any, ...optionalParams: any[]): void;
  warn(message?: any, ...optionalParams: any[]): void;
}
