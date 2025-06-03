export type MovieAction = 'created' | 'updated' | 'deleted'

type Event<T extends string> = {
  topic: `movie-${T}`
  // key is an id as string, value is serilized object
  messages: Array<{ key: string; value: string }>
}

export type MovieEvent = Event<MovieAction>
