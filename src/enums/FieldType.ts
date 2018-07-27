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
    image: (value: any) => value
};
