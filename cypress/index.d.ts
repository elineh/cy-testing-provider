export {}

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      /** If the token exists, reuse it
       * If no token exists, get a new one */
      maybeGetToken(sessionName: string): Chainable<string>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.skipOn('localhost')` */
      skipOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>

      /** https://www.npmjs.com/package/@cypress/skip-test
       * `cy.onlyOn('localhost')` */
      onlyOn(
        nameOrFlag: string | boolean | (() => boolean),
        cb?: () => void
      ): Chainable<Subject>
    }
  }
}
