module.exports = {
    printWidth: 100,
    singleQuote: true,
    tabWidth: 2,
    trailingComma: 'es5',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 4,
            },
        },
        {
            files: '*.vue',
            options: {
                printWidth: 120,
            },
        },
        {
            files: '.prettierrc.js',
            options: {
                tabWidth: 4,
            },
        },
    ],
};
