describe('App Initialization', () => {
  it('renders main app components', () => {
    cy.log('Environment check');
    cy.window().then(win => {
      cy.log('ENV vars:', {
        COUCHDB_SERVER: win.ENV?.COUCHDB_SERVER_URL,
        COUCHDB_PROTOCOL: win.ENV?.COUCHDB_SERVER_PROTOCOL,
      });
    });

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
