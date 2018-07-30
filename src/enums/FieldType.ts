export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int',
    IMAGE = 'image'
}

export const fieldConverters = {
    string: (value: string) => value,
    number: (value: string) => {
        return parseFloat(value);
    },
    int: (value: string) => {
        return parseInt(value, 10);
    },
    image: (value: {
        content_type: string,
        data: Blob
    }) => {
        if (value) {
            return value.data;
        } else {
            return new Blob();
        }
    }
};
