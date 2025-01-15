// stores/useAuthStore.ts
import { defineStore } from 'pinia';
import { User } from '@/db/userDB';
import ENV from '@/ENVIRONMENT_VARS';

interface AuthState {
  _user?: User;
  loginAndRegistration: {
    init: boolean;
    loggedIn: boolean;
    regDialogOpen: boolean;
    loginDialogOpen: boolean;
  };
  onLoadComplete: boolean;
}

export const GuestUsername: string = 'Guest';

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    _user: undefined,
    loginAndRegistration: {
      init: false,
      loggedIn: false,
      regDialogOpen: false,
      loginDialogOpen: false,
    },
    onLoadComplete: false,
  }),

  actions: {
    async init() {
      const authXML = new XMLHttpRequest();
      authXML.withCredentials = true;

      authXML.onerror = (e) => {
        console.error('init XHR Error:', e);
      };

      authXML.onreadystatechange = () => {
        console.log(`init ReadyState: ${authXML.readyState}, Status: ${authXML.status}`);
      };

      authXML.addEventListener('load', async () => {
        console.log(`init listener running`);
        try {
          const resp: {
            info: {};
            ok: boolean;
            userCtx: {
              name: string;
              roles: string[];
            };
          } = JSON.parse(authXML.responseText);
          console.log(`init resp: ${JSON.stringify(resp)}`);

          if (resp.userCtx.name && resp.userCtx.name !== '') {
            this._user = await User.instance(resp.userCtx.name);
            this.loginAndRegistration.loggedIn = true;
          } else {
            this._user = await User.instance(GuestUsername);
            this.loginAndRegistration.loggedIn = false;
          }

          console.log('init ONLOAD COMPLETE');
          this.onLoadComplete = true;
          this.loginAndRegistration.init = true;
        } catch (e) {
          console.log(`init error`);
          console.error(`init error:`, e);
        }
      });

      console.log(`init open running`);
      const url = `${ENV.COUCHDB_SERVER_PROTOCOL}://${ENV.COUCHDB_SERVER_URL}_session`;
      console.log(`Attempting to connect to: ${url}`);
      authXML.open('GET', url);
      console.log(`init send running`);
      authXML.send();
    },

    setLoginDialog(open: boolean) {
      this.loginAndRegistration.loginDialogOpen = open;
    },

    setRegDialog(open: boolean) {
      this.loginAndRegistration.regDialogOpen = open;
    },
  },

  getters: {
    currentUser: (state) => state._user,
    isLoggedIn: (state) => state.loginAndRegistration.loggedIn,
    isInitialized: (state) => state.loginAndRegistration.init,
    status: (state) => {
      return {
        loggedIn: state.loginAndRegistration.loggedIn,
        init: state.loginAndRegistration.init,
        user: state._user ? state._user.username : 'Guest',
      };
    },
  },
});
