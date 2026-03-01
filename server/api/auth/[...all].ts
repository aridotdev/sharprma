/**
 * Better Auth catch-all API route handler.
 * Forwards all /api/auth/* requests to the Better Auth handler.
 */
export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
