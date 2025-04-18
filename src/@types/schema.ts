import { z } from 'zod'
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'

extendZodWithOpenApi(z)

// 1) Create the schemas

export const CreateMovieSchema = z
  .object({
    id: z
      .number()
      .int()
      .optional()
      .openapi({ example: 1, description: 'Movie ID' }),
    name: z
      .string()
      .min(1)
      .openapi({ example: 'The Matrix', description: 'Movie name' }),
    year: z
      .number()
      .int()
      .min(1900)
      .max(2024)
      .optional()
      .openapi({ example: 1999, description: 'Release year' }),
    rating: z.number().openapi({ example: 7.5, description: 'Rating' })
  })
  .openapi('CreateMovieRequest')

export const CreateMovieResponseSchema = z
  .object({
    status: z
      .number()
      .int()
      .openapi({ example: 200, description: 'Response status code' }),
    data: z.object({
      id: z.number().int().openapi({ example: 1, description: 'Movie ID' }),
      name: z
        .string()
        .openapi({ example: 'The Matrix', description: 'Movie name' }),
      year: z
        .number()
        .int()
        .openapi({ example: 1999, description: 'Release year' }),
      rating: z.number().openapi({ example: 7.5, description: 'Rating' })
    }),
    error: z
      .string()
      .optional()
      .openapi({ description: 'Error message, if any' })
  })
  .openapi('CreateMovieResponse')

export const ConflictMovieResponseSchema = z.object({
  status: z
    .number()
    .int()
    .openapi({ example: 409, description: 'Conflict status code' }),
  error: z
    .string()
    .openapi({ example: 'Movie already exists', description: 'Error message' })
})

const movieObj = {
  id: z.number().openapi({ example: 1, description: 'Movie ID' }),
  name: z
    .string()
    .openapi({ example: 'The Matrix', description: 'Movie name' }),
  year: z.number().openapi({ example: 1999, description: 'Release year' }),
  rating: z.number().openapi({ example: 7.5, description: 'Rating' })
}

export const GetMovieResponseUnionSchema = z
  .object({
    status: z
      .number()
      .int()
      .openapi({ example: 200, description: 'Response status code' }),
    data: z.union([
      z
        .object(movieObj)
        .nullable()
        .openapi({
          description: 'Movie details or null if not found',
          example: { id: 1, name: 'The Matrix', year: 1999, rating: 7.5 }
        }),
      z.array(z.object(movieObj)).openapi({
        description: 'List of movies for an empty array if no movies exists',
        example: []
      })
    ]),
    error: z.string().nullable().optional().openapi({
      description: 'Error message, if an error occurred, otherwise null',
      example: null
    })
  })
  .openapi('GetMovieResponse')

export const MovieNotFoundResponseSchema = z.object({
  status: z
    .number()
    .int()
    .openapi({ example: 404, description: 'Not found status code' }),
  error: z
    .string()
    .openapi({ example: 'Movie not found', description: 'Error message' })
})

export const DeleteMovieResponseSchema = z.object({
  status: z
    .number()
    .int()
    .openapi({ example: 200, description: 'Response status code' }),
  message: z.string().openapi({
    example: 'Movie {id} has been deleted',
    description: 'Success message for the deleted movie'
  })
})

export const UpdateMovieSchema = z
  .object({
    id: z.number().optional().openapi({ example: 1, description: 'Movie ID' }),
    name: z
      .string()
      .min(1)
      .optional()
      .openapi({ example: 'The Matrix', description: 'Movie name' }),
    year: z
      .number()
      .int()
      .min(1900)
      .max(2024)
      .optional()
      .openapi({ example: 1999, description: 'Release year' }),
    rating: z
      .number()
      .optional()
      .openapi({ example: 7.5, description: 'Rating' })
  })
  .openapi('UpdateMovieRequest')

export const UpdateMovieResponseSchema = z
  .object({
    status: z
      .number()
      .int()
      .openapi({ example: 200, description: 'Response status code' }),
    data: z
      .object({
        id: z.number().openapi({ example: 1, description: 'Movie ID' }),
        name: z
          .string()
          .openapi({ example: 'The Matrix', description: 'Movie name' }),
        year: z
          .number()
          .openapi({ example: 1999, description: 'Release year' }),
        rating: z.number().openapi({ example: 7.5, description: 'Rating' })
      })
      .openapi({ description: 'Updated movie details' }),
    error: z.string().nullable().optional().openapi({
      description: 'Error message, if an error occurred, otherwise null'
    })
  })
  .openapi('UpdatedMovieResponse')
