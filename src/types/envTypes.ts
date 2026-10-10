import { JwtSignOptions } from '@nestjs/jwt'

export type Env = {
  PORT: number
  DOMAINS: string
  REDIS_URL: string
  JWTSECRET: string
  DATABASE_URL: string
  COOKIE_SECRET: string
  ACCESS_TOKEN_EXPIRES: JwtSignOptions['expiresIn']
  REFRESH_TOKEN_EXPIRES: JwtSignOptions['expiresIn']
}
