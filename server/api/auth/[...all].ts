// server/api/auth/[...all].ts
// Mount Better-Auth handler ke Nuxt server route
// Semua endpoint Better-Auth (sign-in, sign-out, get-session, dll) tersedia di /api/auth/*
// import { auth } from '~~/server/utils/auth'

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
