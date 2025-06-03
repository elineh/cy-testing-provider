import type {
  MovieAction,
  MovieEvent
} from '../../src/@types/movie-event-types'
import { logFilePath } from '../../src/events/log-file-path'

/**
 * Reshapes the Kafka event entry into a simplified format for easier processing.
 *
 * @param {MovieEvent} entry - The Kafka event entry containing topic and message details.
 * @returns {{topic: string, key: string, movie: Movie}} - Returns a simplified object with the topic, key, and movie details.
 */
const reshape = (entry: MovieEvent) => ({
  topic: entry.topic,
  key: entry.messages[0]?.key,
  movie: JSON.parse(entry.messages[0]?.value as unknown as string)
})

/**
 * Curried filter function to filter by topic and movieId.
 *
 * @param {number} movieId - The ID of the movie to filter by.
 * @param {string} topic - The Kafka topic to filter by.
 * @returns {(entries: Array<ReturnType<typeof reshape>>) => Array}  - A function that filters entries based on the topic and movieId.
 */
const filterByTopicAndId =
  (movieId: number, topic: string) => (entries: ReturnType<typeof reshape>[]) =>
    entries.filter(
      (entry) => entry.topic === topic && entry.movie?.id == movieId
    )

/**
 * Parses the Kafka event log file and returns the events based on movieId and topic.
 *
 * @param {number} movieId - The ID of the movie to parse events for.
 * @param {`movie-${MovieAction}`} topic - The topic to parse events for.
 * @param {string} [filePath=logFilePath] - Optional file path for the Kafka event log file.
 * @returns {Cypress.Chainable<any>} - Returns a chainable object with the parsed events.
 */
export const parseKafkaEvents = (
  movieId: number,
  topic: `movie-${MovieAction}`,
  filePath = logFilePath
) =>
  cy
    .print('parsing Kafka events...')
    .readFile(filePath)
    .invoke('trim')
    .invoke('split', '\n')
    .map(JSON.parse)
    .map(reshape)
    .apply(filterByTopicAndId(movieId, topic))
