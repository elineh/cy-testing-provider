import type { Request, Response, NextFunction } from 'express'

// In Express, a middleware is a function that sits between a request and the response.
// It checks or modifies the request as it moves along.
// Think of it as a "checkpoint" where the request stops briefly, gets processed,
// and then moves on to the next step or to the final response.

// define a type for the token's structure, which contains the issuedAt date

type Token = {
  issuedAt: Date
} // the token contains a precise Date object

// Function to check if the token's timestamp is within 1 hour

const isValidAuthTimeStamps = (token: Token): boolean => {
  const tokenTime = token.issuedAt.getTime() // get time in milliseconds
  const currentTime = new Date().getTime() // get current time in milliseconds
  const diff = (currentTime - tokenTime) / 1000 // get the difference in seconds

  return diff >= 0 && diff <= 3600 // return true if the difference is within 1 hour
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization // get the Authorization header
  if (!authHeader) {
    return res
      .status(401)
      .json({ error: 'Unauthorized; no Authorization header', status: 401 }) // return 401 if no header
  }

  const tokenStr = authHeader.replace('Bearer ', '') // remove 'Bearer ' from the header
  const token: Token = { issuedAt: new Date(tokenStr) } // create a token object

  if (!isValidAuthTimeStamps(token)) {
    return res
      .status(401)
      .json({ error: 'Unauthorized; invalid token timestamp', status: 401 }) // return 401 if invalid timestamp
  }

  next() // call the next middleware or route handler if valid
}
