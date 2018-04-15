import Vue from 'vue';
import {VueConstructor} from 'vue';
import { NoteCtor, VueComponentName } from '@/db/types';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';

export interface DataShape {
    name: NoteCtor;
    fields: FieldDefinition[];
    views: Array<VueConstructor<Vue>>;
}
