import type { Movie } from '@prisma/client'
import { Prisma, PrismaClient } from '@prisma/client'
import type { DeepMockProxy } from 'jest-mock-extended'
import { mockDeep } from 'jest-mock-extended'
import { MovieAdapter } from '../src/movie-adapter'
import {
  generateMovieWithId,
  generateMovieWithoutId
} from './test-helpers/factories'

// In this test suite, we are testing the Adapter
// which is responsible for interacting with the data source (Prisma)

// Since this is an adapter in the hexagonal architecture (ports & adapters)
// its primary role is to  handle data persistence and retrieval
// and the tests here ensure that it behaves correctly in terms of data handling and error managetment
//
// By mocking PrismaClient, we isolate the tests to focus solely on the adapter's logic and its interaction with Prisma's API.
// This allows us to ttest how the adapter handles different scenarios and edge cases
// like successfully retrieving or creating data, and how it manages errors (e.g. database connection issues)
//
// These tests do not touche the real database, making them unit tests that ensure correctness
// of the adapte's interaction with the mocked data layer

/*
 * Below is a Jest mock setup for the @prisma/client module in a TypeScript test file. Jest is a popular testing framework for JavaScript and TypeScript, and mocking is a technique used to replace real implementations with controlled, test-specific versions.

In this code, the jest.mock function is used to mock the @prisma/client module. The first argument to jest.mock is the module name, and the second argument is a factory function that returns the mock implementation.

Inside the factory function, jest.requireActual('@prisma/client') is called to get the actual implementation of the @prisma/client module. This allows the mock to retain all the original functionality of the module, except for the parts that are explicitly overridden.

The returned object spreads the properties of the actual Prisma client (...actualPrisma) and overrides the PrismaClient class with a mock implementation. The jest.fn() function creates a mock function, and mockDeep<PrismaClient>() is used to deeply mock the PrismaClient class. This means that all methods and properties of PrismaClient will be mocked, allowing for fine-grained control over its behavior in tests.

This setup is useful for isolating the code under test from the actual database interactions, making tests faster and more reliable by avoiding dependencies on a real database.
 */
jest.mock('@prisma/client', () => {
  const actualPrisma = jest.requireActual('@prisma/client')
  return {
    ...actualPrisma,
    PrismaClient: jest.fn(() => mockDeep<PrismaClient>()) // mock PrismaClient
  }
})

describe('MovieAdapter', () => {
  let prismaMock: DeepMockProxy<PrismaClient>
  let movieAdapter: MovieAdapter

  const mockMovie: Movie = generateMovieWithId()

  beforeEach(() => {
    prismaMock = new PrismaClient() as DeepMockProxy<PrismaClient>
    movieAdapter = new MovieAdapter(prismaMock)
  })

  describe('getMovies', () => {
    it('should get all movies', async () => {
      prismaMock.movie.findMany.mockResolvedValue([mockMovie])

      const { data } = await movieAdapter.getMovies()

      expect(data).toEqual([mockMovie])
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })

    it('should get all movies and get an empty array', async () => {
      prismaMock.movie.findMany.mockResolvedValue([])

      const { data } = await movieAdapter.getMovies()

      expect(data).toEqual([])
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })

    it('should handle errors in getMovies', async () => {
      prismaMock.movie.findMany.mockRejectedValue(
        new Error('Error fetching all movies')
      )
      const result = await movieAdapter.getMovies()
      expect(result.data).toBeNull()
      expect(prismaMock.movie.findMany).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieById', () => {
    it('should get a movie by id', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(mockMovie)

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById(mockMovie.id)

      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should return null if movie by id is not found', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null)
      const id = 999

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById(id)

      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
    })

    it('should handle errors in getMovieById', async () => {
      prismaMock.movie.findUnique.mockRejectedValue(
        new Error('Error fetching movie by id')
      )

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieById(1)

      expect(data).toBeNull()
      expect(prismaMock.movie.findUnique).toHaveBeenCalledTimes(1)
    })
  })

  describe('getMovieByName', () => {
    it('should get a movie by name', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(mockMovie)

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieByName(mockMovie.name)

      expect(data).toEqual(mockMovie)
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name: mockMovie.name }
      })
    })

    it('should return null if movie by name is not found', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null)
      const name = 'Non-existent movie'

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieByName(name)

      expect(data).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledWith({
        where: { name }
      })
    })

    it('should handle errors in getMovieByName', async () => {
      prismaMock.movie.findFirst.mockRejectedValue(
        new Error('Error fetching movie by name')
      )

      // @ts-expect-error Typescript should chill for tests here
      const { data } = await movieAdapter.getMovieByName('The Matrix')

      expect(data).toBeNull()
      expect(prismaMock.movie.findFirst).toHaveBeenCalledTimes(1)
    })
  })

  describe('deleteMovieById', () => {
    it('should delete a movie by id', async () => {
      prismaMock.movie.delete.mockResolvedValue({} as Movie)

      const result = await movieAdapter.deleteMovieById(mockMovie.id)

      const expectedResult = {
        status: 200,
        message: `Movie ${mockMovie.id} has been deleted`
      }

      expect(result).toStrictEqual(expectedResult)
      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id: mockMovie.id }
      })
    })

    it('should delete a movie and return false if the movie is not found', async () => {
      prismaMock.movie.delete.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError('Movie not found', {
          code: 'P2025',
          clientVersion: '1'
        })
      )
      const id = 999

      const result = await movieAdapter.deleteMovieById(id)

      const expectedResult = {
        status: 404,
        error: `Movie with ID ${id} not found`
      }

      expect(result).toStrictEqual(expectedResult)
      expect(prismaMock.movie.delete).toHaveBeenCalledWith({
        where: { id }
      })
    })

    it('should call handleError and rethrow unexpected errors in deleteMovieById', async () => {
      const unexpectedError = new Error('Unexpected error')
      prismaMock.movie.delete.mockRejectedValue(unexpectedError)
      const id = 999

      // spy on the handleError method to ensure it's called
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      await expect(movieAdapter.deleteMovieById(id)).rejects.toThrow(
        unexpectedError
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(unexpectedError)
      expect(prismaMock.movie.delete).toHaveBeenCalledTimes(1)
    })
  })

  describe('addMovie', () => {
    const movieData = { ...generateMovieWithoutId(), name: 'Inception' }
    const id = 1
    const movie = { id, ...movieData }

    it('should successfully add a movie without specifying an id', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual({ status: 200, data: movie })
      expect(prismaMock.movie.create).toHaveBeenCalledWith({ data: movieData })
    })

    it('should successfully add a movie specifying an id', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // no existing movie
      prismaMock.movie.create.mockResolvedValue(movie)

      const result = await movieAdapter.addMovie(movieData, id)
      expect(result).toEqual({ status: 200, data: movie })
      expect(prismaMock.movie.create).toHaveBeenCalledWith({ data: movie })
    })

    it('should return 409 if the movie already exists', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(movie) // existing movie

      const result = await movieAdapter.addMovie(movieData)

      expect(result).toEqual(
        expect.objectContaining({
          status: 409,
          error: `Movie ${movie.name} already exists`
        })
      )
    })

    it('should return 500 if an unexpected error occurs', async () => {
      prismaMock.movie.findFirst.mockResolvedValue(null) // no existing movie
      const error = 'Unexpected error'
      prismaMock.movie.create.mockRejectedValue(new Error(error))

      // spy on the handleError method to ensure it's called
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      const result = await movieAdapter.addMovie(movieData)
      expect(result).toEqual(
        expect.objectContaining({
          status: 500,
          error: 'Internal server error'
        })
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(new Error(error))
    })
  })

  describe('updateMovie', () => {
    const id = 1
    const existingMovie = { name: 'Inception', year: 2010, id, rating: 7.5 }
    const updateMovieData = { name: 'The Dark Knight', year: 2008, rating: 8.5 }
    const updatedMovie = { id, ...updateMovieData }

    it('should successfully update a movie', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(existingMovie)
      prismaMock.movie.update.mockResolvedValue(updatedMovie)

      const result = await movieAdapter.updateMovie(updateMovieData, id)
      expect(result).toEqual({ status: 200, data: updatedMovie })
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
      expect(prismaMock.movie.update).toHaveBeenCalledWith({
        where: { id },
        data: updateMovieData
      })
    })

    it('should return 404 if the movie is not found', async () => {
      prismaMock.movie.findUnique.mockResolvedValue(null)

      const result = await movieAdapter.updateMovie(updateMovieData, id)

      expect(result).toEqual(
        expect.objectContaining({
          status: 404,
          error: `Movie with ID ${id} not found`
        })
      )
      expect(prismaMock.movie.findUnique).toHaveBeenCalledWith({
        where: { id }
      })
      expect(prismaMock.movie.update).not.toHaveBeenCalled()
    })

    it('should return 500 if an unexpected error occurs', async () => {
      // Mock the movie to be found in the db
      prismaMock.movie.findUnique.mockResolvedValue(existingMovie)
      // Mock an unexpected error during the update
      const error = prismaMock.movie.update.mockRejectedValue(
        new Error('Unexpected error')
      )
      prismaMock.movie.update.mockRejectedValue(error)

      // spy on the handleError method to ensure it's called
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn(movieAdapter as any, 'handleError')

      const result = await movieAdapter.updateMovie(updateMovieData, id)
      expect(result).toEqual(
        expect.objectContaining({
          status: 500,
          error: 'Internal server error'
        })
      )
      expect(handleErrorSpy).toHaveBeenCalledWith(error)
    })
  })
})
