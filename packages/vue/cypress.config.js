const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/cypress/fixtures',
    devServer: {
      command: 'vue-cli-service serve --host localhost',
      url: 'http://localhost:8080',
    },
  },
});
