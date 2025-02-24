import type { Request, Response, NextFunction } from 'express'
import { validateId } from './validate-movie-id'

describe('validate middleware', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let nextFunction: NextFunction

  beforeEach(() => {
    mockRequest = {
      headers: {}
    }
    mockResponse = {
      // mocked to return this (the mockResponse object)
      // allowing method chaining like res.status().json().
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    nextFunction = jest.fn()
  })

  it('should pass for valid movie ID', () => {
    // Arrange
    mockRequest.params = { id: '123' }

    // Act
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockRequest.params.id).toBe('123')
    expect(nextFunction).toHaveBeenCalled()
    expect(mockResponse.status).not.toHaveBeenCalled()
    expect(mockResponse.json).not.toHaveBeenCalled()
  })

  it('should return 400 for invalid movie ID', () => {
    // Arrange
    mockRequest.params = { id: 'abc' }

    // Act
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })
    expect(mockRequest.params.id).toBe('abc') // unchanged as invalid ID was passed in the request
  })

  it('should handle missing ID parameter', () => {
    // Arrange
    mockRequest.params = {} // ID parameter is not set

    // Act
    validateId(mockRequest as Request, mockResponse as Response, nextFunction)

    // Assert
    expect(mockRequest.params.id).toBeUndefined() // ID parameter is not set
    expect(mockResponse.status).toHaveBeenCalledWith(400)
    expect(nextFunction).not.toHaveBeenCalled()
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid movie ID provided'
    })
  })
})
