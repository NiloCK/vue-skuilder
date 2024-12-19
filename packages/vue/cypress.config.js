const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    specPattern: 'tests/cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'tests/cypress/support/e2e.{js,jsx,ts,tsx}',
    fixturesFolder: 'tests/cypress/fixtures',
  },
});
