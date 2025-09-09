import 'cypress-ajv-schema-validator'
import type { Movie } from '@prisma/client'
import { generateMovieWithoutId } from '../../src/test-helpers/factories'
import spok from 'cy-spok'
import jsonSchema from '../../src/api-docs/openapi.json'
import { retryableBefore } from 'cy-retryable-before'
import type { OpenAPIV3_1 } from 'openapi-types'

// Cast the imported schema to the correct type
const schema: OpenAPIV3_1.Document = jsonSchema as OpenAPIV3_1.Document

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
    cy.maybeGetToken('token-session').then((t) => {
      token = t
    })
  })

  it('should crud', () => {
    cy.addMovie(token, movie)
      .validateSchema(schema, { endpoint: '/movies', method: 'POST' })
      .its('body')
      .should(
        spok({
          status: 200,
          data: movieProps
        })
      )
      .its('data.id')
      .then((id) => {
        cy.getAllMovies(token)
          .validateSchema(schema, {
            endpoint: '/movies',
            method: 'GET'
          })
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
          .validateSchema(schema, {
            endpoint: '/movies/{id}',
            method: 'GET'
          })
          .its('body')
          .should(
            spok({
              status: 200,
              data: movieProps
            })
          )
          .its('data.name')
          .then((name) => {
            cy.getMovieByName(token, name)
              .validateSchema(schema, {
                endpoint: '/movies',
                method: 'GET'
              })
              .its('body')
              .should(
                spok({
                  status: 200,
                  data: movieProps
                })
              )
          })

        cy.updateMovie(token, id, updatedMovie)
          .validateSchema(schema, {
            endpoint: '/movies/{id}',
            method: 'PUT',
            status: 200
          })
          .its('body')
          .should(
            spok({
              status: 200,
              data: {
                id,
                ...updatedMovie
              }
            })
          )

        cy.deleteMovie(token, id)
          .validateSchema(schema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 200
          })
          .its('body')
          .should(
            spok({ status: 200, message: `Movie ${id} has been deleted` })
          )

        cy.getAllMovies(token).findOne({ name: movie.name }).should('not.exist')

        cy.log('**delete non-existing movie**')
        cy.deleteMovie(token, id, true)
          .validateSchema(schema, {
            endpoint: '/movies/{id}',
            method: 'DELETE',
            status: 404
          })
          .its('body')
          .should(
            spok({
              status: 404,
              error: `Movie with ID ${id} not found`
            })
          )
      })
  })
})
