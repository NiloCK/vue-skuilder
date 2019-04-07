export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int',
    IMAGE = 'image',
    MARKDOWN = 'markdown',
    AUDIO = 'audio'
}

const stringConverter: Converter = (value: string) => value;
const numberConverter: Converter = (value: string) => {
    return parseFloat(value);
};
const intConverter: Converter = (value: string) => {
    return parseInt(value, 10);
};

export const fieldConverters:
    { [index: string]: FieldConverter }
    = {
    string: {
        databaseConverter: (value: string) => value,
        previewConverter: (value: string) => value
    },
    number: {
        databaseConverter: numberConverter,
        previewConverter: numberConverter
    },
    int: {
        databaseConverter: intConverter,
        previewConverter: intConverter
    },
    image: {
        databaseConverter: (value) => value,
        previewConverter: (value: {
            content_type: string,
            data: Blob
        }) => {
            if (value) {
                return value.data;
            } else {
                return new Blob();
            }
        }
    }
};

interface FieldConverter {
    databaseConverter: Converter;
    previewConverter: Converter;
}

type Converter = (value: any) => string | number | boolean | Blob;
