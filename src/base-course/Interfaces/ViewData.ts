import { DataShape } from '@/base-course/Interfaces/DataShape';
import { DisplayableData } from '@/db/types';

export interface ViewData {
    [index: string]: string | number | Blob | boolean;
}

export function displayableDataToViewData(data: DisplayableData): ViewData {
    const ret: ViewData = {};
    data.data.forEach( (field) => {
        ret[field.name] = field.data;
    });
    return ret;
}