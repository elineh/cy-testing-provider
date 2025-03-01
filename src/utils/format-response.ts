import type { Response } from 'express'
import type {
  ConflictMovieResponse,
  CreateMovieResponse,
  DeleteMovieResponse,
  GetMovieResponse,
  MovieNotFoundResponse,
  UpdateMovieResponse
} from '../@types'

type MovieResponse =
  | CreateMovieResponse
  | GetMovieResponse
  | UpdateMovieResponse
  | DeleteMovieResponse
  | ConflictMovieResponse
  | MovieNotFoundResponse

export function formatResponse(res: Response, result: MovieResponse) {
  if ('error' in result && result.error) {
    return res
      .status(result.status)
      .json({ status: result.status, error: result.error })
  } else if ('data' in result) {
    if (result.data === null) {
      return res
        .status(result.status)
        .json({ status: result.status, error: 'No movies found' })
    }
    return res
      .status(result.status)
      .json({ status: result.status, data: result.data })
  } else if ('message' in result) {
    // Handle delete movie case with a success message
    return res
      .status(result.status)
      .json({ status: result.status, message: result.message })
  } else {
    return res.status(500).json({ error: 'Internal server error' })
  }
}
