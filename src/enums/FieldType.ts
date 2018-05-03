export enum FieldType {
    STRING = 'string',
    NUMBER = 'number',
    INT = 'int'
}

export const fieldConverters = {
    string: (value: string) => value,
    number: (value: string) => {
        return parseFloat(value);
    },
    int: (value: string) => {
        return parseInt(value, 10);
    }
};


