import { getCurrentInstance, version } from 'vue';
import type { User } from '../db/userDB';

export function SkldrComposable() {
  const instance = getCurrentInstance();
  let componentName: string = 'unknown';

  if (version.startsWith('2')) {
    // vue 2
    componentName = (instance as any).$options.name;
  } else {
    // vue 3
    console.warn(`Migration to Vue 3 complete. Consider revising compat layer in SkldrComposable.`);
    componentName = (instance as any).type?.__name;
  }

  const log = (message?: any, ...optionalParams: any[]): void => {
    console.log(`[SK.${componentName}]: `, message, ...optionalParams);
  };

  const error = (message?: any, ...optionalParams: any[]): void => {
    console.error(`[SK.${componentName}]: `, message, ...optionalParams);
  };

  const warn = (message?: any, ...optionalParams: any[]): void => {
    console.warn(`[SK.${componentName}]: `, message, ...optionalParams);
  };

  return {
    log,
    error,
    warn,
  };
}
