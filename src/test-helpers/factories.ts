import { faker } from '@faker-js/faker'
import type { Movie } from '@prisma/client'

export const generateMovieWithoutId = (): Omit<Movie, 'id'> => {
  return {
    name: faker.lorem.words(3), // random 3-word title
    year: faker.date.past({ years: 50 }).getFullYear(), // random year between 50 years ago and now
    rating: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }) // random rating between 0 and 10
  }
}

export const generateMovieWithId = (): Movie => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }), // random ID between 1 and 1000
    name: faker.lorem.words(3), // random 3-word title
    year: faker.date.past({ years: 50 }).getFullYear(), // random year between 50 years ago and now
    rating: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }) // random rating between 0 and 10
  }
}
