module.exports = {
  presets: [
    [
      '@vue/app',
      {
        useBuiltIns: 'entry',
      },
    ],
  ],
  plugins: ['@babel/plugin-proposal-class-static-block'],
};
