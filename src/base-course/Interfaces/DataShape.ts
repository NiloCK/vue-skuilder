import { NoteCtor } from '@/db/types';
import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';

export interface DataShape {
    name: NoteCtor;
    fields: FieldDefinition[];
}
