import Vue, { VueConstructor } from 'vue';
import Vuex from 'vuex';
import { DataShape } from './base-course/Interfaces/DataShape';
import { ViewData } from './base-course/Interfaces/ViewData';
import { TagStub } from './db/types';
import ENV from './ENVIRONMENT_VARS';
import { CourseConfig } from './server/types';
import { FieldInputInstance } from './components/Edit/ViewableDataInputForm/FieldInput.types';
import { User } from './db/userDB';

Vue.use(Vuex);

export const GuestUsername: string = 'Guest';

interface DataInputForm {
  // current props
  dataShape: DataShape | null;
  course: CourseConfig | null;

  existingData: ViewData[];
  shapeViews: Array<VueConstructor<Vue>>;

  fields: FieldInputInstance[];
  localStore: any; // [ ] type this...

  uploading: boolean;
}

export interface AppState {
  dataInputForm: DataInputForm;
}

export const defaultState: AppState = {
  dataInputForm: {
    course: null,
    dataShape: null,
    existingData: [],
    fields: [],
    localStore: {},
    shapeViews: [],
    uploading: false,
  },
};

const Store = new Vuex.Store<AppState>({
  state: defaultState,
  mutations: {},
  actions: {},
});

export default Store;

export function setDefaultState() {
  // Store.state._user = defaultState._user;
  // Store.state.config = defaultState.config;
  // Store.replaceState(defaultState);
}
