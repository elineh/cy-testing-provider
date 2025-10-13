import 'cypress-ajv-schema-validator'
import type { Movie } from '@prisma/client'
import { generateMovieWithoutId } from '../../src/test-helpers/factories'
const spok = require('cy-spok')
import schema from '../../src/api-docs/openapi.json'
import { retryableBefore } from 'cy-retryable-before'
import type { OpenAPIV3_1 } from 'openapi-types'
import { parseKafkaEvents } from '../support/parse-kafka-events'
import { recurse } from 'cypress-recurse'

// Cast the imported schema to the correct type
const typedSchema: OpenAPIV3_1.Document = schema as OpenAPIV3_1.Document

describe('CRUD movie', () => {
  const movie = generateMovieWithoutId()
  const updatedMovie = generateMovieWithoutId()
  const movieProps: Omit<Movie, 'id'> = {
    name: spok.string,
    year: spok.number,
    rating: spok.number
  }

  let token: string

  retryableBefore(() => {
    // if Kafka UI is not running, skip the test
    cy.exec(
      `curl -s -o /dev/null -w "%{http_code}" ${Cypress.env('KAFKA_UI_URL')}`,
      { failOnNonZeroExit: false }
    ).then((res) => {
      cy.log('**npm run kafka:start to enable this test**')
      cy.skipOn(res.stdout !== '200')
    })

    cy.maybeGetToken('token-session').then((t) => {
      token = t
    })
  })

  it('should crud', () => {
    cy.addMovie(token, movie)
      .validateSchema(typedSchema, { endpoint: '/movies', method: 'POST' })
      .its('body')
      .should(spok({ status: 200, data: movieProps }))
      .its('data.id')
      .then((id) => {
        // check kafka
        recurse(
          () => parseKafkaEvents(id, 'movie-created'),
          spok([
            {
              topic: 'movie-created',
              key: String(id),
              movie: { id, ...movieProps }
            }
          ])
        )

        cy.getAllMovies(token)
          .validateSchema(typedSchema, { endpoint: '/movies', method: 'GET' })
          .its('body')
          .should(
            spok({
              status: 200,
              // test an array of objects with spok
              // You could just check it's an array, but here you can check
              // that is has the movieprops as defined above and has an id
              data: (arr: Movie[]) =>
                arr.map(spok({ id: spok.number, ...movieProps }))
            })
          )

        cy.getMovieById(token, id)
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'GET'
          })
          .its('body')
          .should(spok({ status: 200, data: movieProps }))
          .its('data.name')
          .then((name) => {
            cy.getMovieByName(token, name)
              .validateSchema(typedSchema, {
                endpoint: '/movies',
                method: 'GET'
              })
              .its('body')
              .should(spok({ status: 200, data: movieProps }))
          })

        cy.updateMovie(token, id, updatedMovie)
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'PUT',
            status: 200
          })
          .its('body')
          .should(spok({ status: 200, data: { id, ...updatedMovie } }))

        // Check kafka
        recurse(
          () => parseKafkaEvents(id, 'movie-updated'),
          spok([
            {
              topic: 'movie-updated',
              key: String(id),
              movie: { id, ...movieProps }
            }
          ])
        )

        cy.deleteMovie(token, id)
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 200
          })
          .its('body')
          .should(
            spok({ status: 200, message: `Movie ${id} has been deleted` })
          )

        // Check kafka
        recurse(
          () => parseKafkaEvents(id, 'movie-deleted'),
          spok([
            {
              topic: 'movie-deleted',
              key: String(id),
              movie: { id, ...movieProps }
            }
          ])
        )

        cy.getAllMovies(token).findOne({ name: movie.name }).should('not.exist')

        cy.log('**delete non-existing movie**')
        cy.deleteMovie(token, id, true)
          .validateSchema(typedSchema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 404
          })
          .its('body')
          .should(spok({ status: 404, error: `Movie with ID ${id} not found` }))
      })
  })
})
