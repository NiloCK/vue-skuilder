import Vue, { VueConstructor } from 'vue';
import Vuex from 'vuex';
import { DataShape } from './base-course/Interfaces/DataShape';
import { ViewData } from './base-course/Interfaces/ViewData';
import { TagStub } from './db/types';
import ENV from './ENVIRONMENT_VARS';
import { CourseConfig } from './server/types';
import FormInput from '@/components/Edit/ViewableDataInputForm/FieldInputs/index.vue';

Vue.use(Vuex);

export const GuestUsername: string = 'Guest';

interface DataInputForm {
  // current props
  dataShape: DataShape | null;
  course: CourseConfig | null;

  existingData: ViewData[];
  shapeViews: Array<VueConstructor<Vue>>;

  fields: FormInput[];
  localStore: any;

  uploading: boolean;
}

export interface AppState {
  user: string;
  userLoginAndRegistrationContainer: {
    loggedIn: boolean;
    regDialogOpen: boolean;
    loginDialogOpen: boolean;
  };
  cardPreviewMode: boolean;
  dataInputForm: DataInputForm;
}


const Store = new Vuex.Store<AppState>({
  state: {
    user: '',
    userLoginAndRegistrationContainer: {
      loggedIn: false,
      regDialogOpen: false,
      loginDialogOpen: false
    },
    cardPreviewMode: false,
    dataInputForm: {
      course: null,
      dataShape: null,
      existingData: [],
      fields: [],
      localStore: {},
      shapeViews: [],
      uploading: false
    }
  },
  mutations: {

  },
  actions: {

  }
});

export default Store;

checkAuthCookie();

function checkAuthCookie() {
  const authXML = new XMLHttpRequest();
  authXML.withCredentials = true;
  // tslint:disable-next-line: space-before-function-paren
  authXML.addEventListener('load', function () {
    // todo add link to couchdb doc of this json shape
    const resp: {
      info: {};
      ok: boolean;
      userCtx: {
        name: string;
        roles: string[];
      };
    } = JSON.parse(this.responseText);

    if (resp.userCtx.name !== undefined &&
      resp.userCtx.name !== '' &&
      resp.userCtx.name !== null) {
      Store.state.user = resp.userCtx.name;
    } else {
      Store.state.user = GuestUsername;
    }
  });
  authXML.open(
    'GET',
    ENV.COUCHDB_SERVER_PROTOCOL +
    '://' +
    ENV.COUCHDB_SERVER_URL +
    '_session'
  );
  authXML.send();
}
