import { MovieService } from './movie-service'
import type { MovieRepository } from './movie-repository'
import type { Movie } from '@prisma/client'
import { generateMovieWithoutId } from './test-helpers/factories'

// because we use ports & adapters / hex pattern
// the data layer (MovieRepository) is a dependency we can mock
// this ensures we're testing only the business logic and not the database.

// In this test suite, we are focusing on the Service, which encapsulates the business logic.
// Since we are following ports & adapters (hexagonal) architecture
// the service depends on a port/interface, defined ny the Repository (MovieRepository?).

// We mock the data layer (Repository) to isolate and test only the business logic in the service.
// By mocking the data layer (Repository), we ensure that the tests focus purely on how the service behaves:
// handling input, interacting with the repository, and returning the appropriate output or errors.
// This approach allows us to write unit tests that are fast, isolated, and independent of any external systems like databases.

describe('MovieService', () => {
  let movieService: MovieService
  let mockMovieRepository: jest.Mocked<MovieRepository>

  const id = 1
  const mockMovie: Movie = { ...generateMovieWithoutId(), id }
  const mockMovieResponse = { status: 200, data: mockMovie, error: null }
  const mockMoviesResponse = { status: 200, data: [mockMovie], error: null }
  const notFoundResponse = { status: 404, data: null, error: null }

  beforeEach(() => {
    mockMovieRepository = {
      getMovies: jest.fn(),
      getMovieById: jest.fn(),
      getMovieByName: jest.fn(),
      deleteMovieById: jest.fn(),
      addMovie: jest.fn(),
      updateMovie: jest.fn()
    } as jest.Mocked<MovieRepository>

    movieService = new MovieService(mockMovieRepository)
  })

  it('should get all movies', async () => {
    // Arrange
    mockMovieRepository.getMovies.mockResolvedValue(mockMoviesResponse)

    // Act
    const { data } = await movieService.getMovies()

    // Assert
    expect(data).toEqual([mockMovie])
    expect(mockMovieRepository.getMovies).toHaveBeenCalledTimes(1)
  })

  it('should get a movie by ID', async () => {
    // Arrange
    mockMovieRepository.getMovieById.mockResolvedValue(mockMovieResponse)

    // Act
    // @ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieById(id)

    // Assert
    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should return null if movie id not found', async () => {
    // Arrange
    mockMovieRepository.getMovieById.mockResolvedValue(notFoundResponse)
    const id = 999

    // Act
    // @ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieById(id)

    // Assert
    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieById).toHaveBeenCalledWith(id)
  })

  it('should get a movie by name', async () => {
    // Arrange
    mockMovieRepository.getMovieByName.mockResolvedValue(mockMovieResponse)
    const name = mockMovie.name

    // Act
    // @ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieByName(name)

    // Assert
    expect(data).toEqual(mockMovie)
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(name)
  })

  it('should return null if movie name not found', async () => {
    // Arrange
    mockMovieRepository.getMovieByName.mockResolvedValue(notFoundResponse)
    const name = 'Not Found'

    // Act
    // @ts-expect-error Typescript should chill for tests here
    const { data } = await movieService.getMovieByName(name)

    // Assert
    expect(data).toBeNull()
    expect(mockMovieRepository.getMovieByName).toHaveBeenCalledWith(name)
  })

  it('should add a movie', async () => {
    // Arrange
    const expectedResult = {
      status: 200,
      data: mockMovie,
      error: undefined
    }
    mockMovieRepository.addMovie.mockResolvedValue(expectedResult)

    // Act
    const result = await movieService.addMovie(mockMovie)

    // Assert
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.addMovie).toHaveBeenCalledWith(
      mockMovie,
      undefined
    )
  })

  it('should update a movie', async () => {
    // Arrange
    const expectedResult = {
      status: 200,
      data: mockMovie,
      error: undefined
    }
    mockMovieRepository.updateMovie.mockResolvedValue(expectedResult)

    // Act
    const result = await movieService.updateMovie(
      { name: mockMovie.name, year: mockMovie.year },
      id
    )

    // Assert
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.updateMovie).toHaveBeenCalledWith(
      { name: mockMovie.name, year: mockMovie.year },
      id
    )
  })

  it('should delete a movie by ID', async () => {
    // Arrange
    const expectedResult = {
      status: 200,
      message: `Movie ${id} has been deleted`
    }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)

    // Act
    const result = await movieService.deleteMovieById(id)

    // Assert
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })

  it('should return 400 if addMovie validation fails', async () => {
    // Arrange
    const invalidMovieData = { name: '', year: 1899, rating: 7.5 } // invalid year, empty name

    // Act
    const result = await movieService.addMovie(invalidMovieData)

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be greater than or equal to 1900'
      })
    )
  })

  it('should return 400 if updateMovie validation fails', async () => {
    // Arrange
    const invalidMovieData = { name: '', year: 2030 } // invalid year, empty name

    // Act
    const result = await movieService.updateMovie(invalidMovieData, id)

    // Assert
    expect(result).toEqual(
      expect.objectContaining({
        status: 400,
        error:
          'String must contain at least 1 character(s), Number must be less than or equal to 2024'
      })
    )
  })

  it('should try to delete and not find a movie by ID', async () => {
    // Arrange
    const id = 999
    const expectedResult = {
      status: 404,
      error: `Movie with ID ${id} not found`
    }
    mockMovieRepository.deleteMovieById.mockResolvedValue(expectedResult)

    // Act
    const result = await movieService.deleteMovieById(id)

    // Assert
    expect(result).toEqual(expectedResult)
    expect(mockMovieRepository.deleteMovieById).toHaveBeenCalledWith(id)
  })
})
