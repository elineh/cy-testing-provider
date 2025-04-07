import { truncateTables } from './truncate-tables'

// if this was a before, it would run once in each test file
// since this is beforeEach, if there are multiple it blocks, it will run before each it block in each test file
// as it is, it behaves the same as a before becaise there is 1 it blovk in the pact test

beforeEach(async () => {
  console.log('Running before each test file, on the proviser...')
  await truncateTables()
})
