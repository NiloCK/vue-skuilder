import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { NoteCtor } from '@/db/types';

export interface DataShape {
    name: NoteCtor;
    fields: FieldDefinition[];
}
