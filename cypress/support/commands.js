// vue-skuilder/cypress/support/commands.js
// This file contains custom commands for Cypress tests

// Add any custom commands you need, for example:

// -- Example: Custom command for login --
// Cypress.Commands.add('login', (email, password) => {
//   cy.visit('/login');
//   cy.get('[data-cy="email-input"]').type(email);
//   cy.get('[data-cy="password-input"]').type(password);
//   cy.get('[data-cy="login-button"]').click();
// });

// You can read more about custom commands here:
// https://on.cypress.io/custom-commands

Cypress.Commands.add('registerUser', (username = null, password = 'securePassword123') => {
  // Generate a unique username if none provided
  const finalUsername = username || `testuser${Date.now()}`;

  // Visit the signup page
  cy.visit('/');
  cy.contains('Sign Up').click();

  // Fill out the registration form
  cy.get('input[name="username"]').type(finalUsername);
  cy.get('input[name="password"]').type(password);
  cy.get('input[name="retypedPassword"]').type(password);

  // Submit the form
  cy.contains('button', 'Create Account').click();

  // Wait for registration to complete
  cy.url().should('include', `/u/${finalUsername}/new`);

  // Return the created username so it can be used in tests
  return cy.wrap(finalUsername);
});
