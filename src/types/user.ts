export interface JwtToken {
  id: number
  publicId: string
  email: string
  name: string
  jti: string
  iat: number
  exp: number
}
