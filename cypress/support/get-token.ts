import 'cypress-data-session'

const getToken = () =>
  cy.api({ method: 'GET', url: '/auth/fake-token' }).its('body.token')

const maybeGetToken = (sessionName: string) =>
  cy.dataSession({
    name: sessionName,
    validate: (): true => true,
    setup: getToken, // functional programming function calling a function no arguments

    shareAcrossSpecs: true
  })
Cypress.Commands.add('maybeGetToken', maybeGetToken)
