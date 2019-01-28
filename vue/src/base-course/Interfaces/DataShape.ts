import { FieldDefinition } from '@/base-course/Interfaces/FieldDefinition';
import { NoteCtor } from '@/db/types';
import { DataShapeName } from '@/enums/DataShapeNames';

export interface DataShape {
    name: DataShapeName;
    fields: FieldDefinition[];
}
