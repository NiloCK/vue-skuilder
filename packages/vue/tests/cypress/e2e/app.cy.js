describe('App Initialization', () => {
  it('renders main app components', () => {
    cy.visit('/');

    // Wait for app to initialize
    cy.get('#app').should('exist');
    cy.get('.application').should('be.visible');

    // Check main structure (update selectors for Vuetify 1.5.x)
    cy.get('.application--wrap').within(() => {
      cy.get('.v-navigation-drawer').should('exist');
    });
  });
});
