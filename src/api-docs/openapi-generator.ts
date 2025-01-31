import {
  OpenAPIRegistry,
  OpenApiGeneratorV31
} from '@asteasolutions/zod-to-openapi'
import {
  CreateMovieSchema,
  CreateMovieResponseSchema,
  UpdateMovieSchema,
  UpdateMovieResponseSchema,
  GetMovieResponseUnionSchema,
  MovieNotFoundResponseSchema,
  DeleteMovieResponseSchema,
  ConflictMovieResponseSchema
} from '../@types/schema'
import type { ParameterObject } from 'openapi3-ts/oas31'

// this file registers the shcemas and generates the OpenApi document
// it's the logic responsible for creating the OpenApi structure
// based on the zod schemas

// 2) register the Schemas with the OpenAPIRegistry

const registry = new OpenAPIRegistry()
registry.register('CreateMovieRequest', CreateMovieSchema)
registry.register('CreateMovieResponse', CreateMovieResponseSchema)
registry.register('GetMovieResponseUnion', GetMovieResponseUnionSchema)
registry.register('MovieNotFoundResponse', MovieNotFoundResponseSchema)
registry.register('DeleteMovieResponse', DeleteMovieResponseSchema)
registry.register('ConflictMovieResponse', ConflictMovieResponseSchema)
registry.register('UpdateMovieRequest', UpdateMovieSchema)
registry.register('UpdateMovieResponse', UpdateMovieResponseSchema)

// constants to avoid repetition

const MOVIE_ID_PARAM: ParameterObject = {
  name: 'id',
  in: 'path',
  required: true,
  schema: {
    type: 'integer'
  },
  description: 'Movie ID'
}

const MOVIE_NAME_PARAM: ParameterObject = {
  name: 'name',
  in: 'query',
  required: false,
  schema: {
    type: 'string'
  },
  description: 'Movie name to search for'
}

// register the paths with the OpenApi generator
registry.registerPath({
  method: 'get',
  path: '/',
  summary: 'Health check',
  responses: {
    200: {
      description: 'Server is running from health check.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Server is running from health check.'
              }
            }
          }
        }
      }
    }
  }
})

// register path for getting all movies or filtering by name via query parameter
registry.registerPath({
  method: 'get',
  path: '/movies',
  summary: 'Get all movies or filter by name',
  description:
    'Retrieves a list of all movies or filters by name if query parameter is provided',
  parameters: [MOVIE_NAME_PARAM], // query parameter forl filtering by name
  responses: {
    200: {
      description:
        'List of movies or a specific movie if the "name" query parameter is provided',
      content: {
        'application/json': {
          schema: GetMovieResponseUnionSchema
        }
      }
    },
    404: {
      description:
        'Movie not found if the name is provided and does not match any movie',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

// register path for getting a specific movie by ID
registry.registerPath({
  method: 'get',
  path: '/movies/{id}',
  summary: 'Get movie by ID',
  description: 'Retrieves a specific movie by ID',
  parameters: [MOVIE_ID_PARAM], // path parameter for the movie ID
  responses: {
    200: {
      description: 'Movie found',
      content: {
        'application/json': {
          schema: GetMovieResponseUnionSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

// register a path for creating/adding a movie
registry.registerPath({
  method: 'post',
  path: '/movies',
  summary: 'Create a new movie',
  description: 'Creates a new movie in the system',
  request: {
    body: {
      content: {
        'application/json': {
          schema: CreateMovieSchema
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Movie created successfully',
      content: {
        'application/json': {
          schema: CreateMovieResponseSchema
        }
      }
    },
    400: {
      description: 'Invalid request body or validation error'
    },
    409: {
      description: 'Movie already exists',
      content: {
        'application/json': {
          schema: ConflictMovieResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error'
    }
  }
})

// delete movie
registry.registerPath({
  method: 'delete',
  path: '/movies/{id}',
  summary: 'Delete a movie by ID',
  description: 'Deletes a movie by ID',
  parameters: [MOVIE_ID_PARAM], // path parameter for the movie ID
  responses: {
    200: {
      description: 'Movie {id} has been deleted',
      content: {
        'application/json': {
          schema: DeleteMovieResponseSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    }
  }
})

// update movie
registry.registerPath({
  method: 'put',
  path: '/movies/{id}',
  summary: 'Update a movie by ID',
  description: 'Updates a movie by ID',
  parameters: [MOVIE_ID_PARAM], // path parameter for the movie ID
  request: {
    body: {
      content: {
        'application/json': {
          schema: UpdateMovieSchema
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Movie {id} updated successfully',
      content: {
        'application/json': {
          schema: UpdateMovieResponseSchema
        }
      }
    },
    404: {
      description: 'Movie not found',
      content: {
        'application/json': {
          schema: MovieNotFoundResponseSchema
        }
      }
    },
    500: {
      description: 'Internal server error'
    }
  }
})

// 3) Generate the OpenAPI document
const generator = new OpenApiGeneratorV31(registry.definitions)

export const openApiDoc = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'Movies API',
    version: '0.0.1',
    description: 'API for managing movies'
  },
  servers: [
    {
      url: 'http://localhost:3001',
      description: 'Local development server'
    },
    {
      url: 'https://movies-api.example.com',
      description: 'Production server'
    }
  ]
})
