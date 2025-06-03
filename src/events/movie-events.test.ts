import { produceMovieEvent } from './movie-events'
import { Kafka } from 'kafkajs'
import type { Movie } from '@prisma/client'
import { generateMovieWithId } from '../test-helpers/factories'
import { expect } from '@jest/globals'

// Mock kafkajs
jest.mock('kafkajs', () => ({
  Kafka: jest.fn().mockImplementation(() => ({
    producer: jest.fn(() => ({
      connect: jest.fn().mockResolvedValue(undefined),
      send: jest.fn().mockResolvedValue(undefined),
      disconnect: jest.fn()
    }))
  }))
}))

// Mock fs
jest.mock('node:fs/promises', () => ({
  appendFile: jest.fn().mockResolvedValue(undefined)
}))

// Mock console.table and console.error
global.console.table = jest.fn()
global.console.error = jest.fn()

describe('produceMovieEvent', () => {
  const mockMovie: Movie = generateMovieWithId()
  const key = mockMovie.id.toString()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should produce a movie event successfully', async () => {
    const kafkaInstance = new Kafka({
      clientId: 'test-client',
      brokers: ['localhost:29092']
    })
    const event = {
      topic: 'movie-created', // TODO - does this need to be similar to the movie-event type?
      messages: [
        {
          key,
          value: JSON.stringify(mockMovie)
        }
      ]
    }
    const producer = kafkaInstance.producer()
    await producer.connect()
    await producer.send(event)
    await producer.disconnect()

    const result = await produceMovieEvent(mockMovie, 'created')

    expect(Kafka).toHaveBeenCalledWith(expect.any(Object))
    expect(producer.connect).toHaveBeenCalled()
    expect(producer.send).toHaveBeenCalledWith(event)
    expect(producer.disconnect).toHaveBeenCalled()

    expect(console.table).toHaveBeenCalled()
    expect(console.error).not.toHaveBeenCalled()
    expect(result).toEqual({
      topic: 'movie-created',
      messages: [
        {
          key,
          value: mockMovie
        }
      ]
    })
  })
})
