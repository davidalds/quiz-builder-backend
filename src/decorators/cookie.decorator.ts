import { RequestCookieKeys } from '@/types/requestCookieType'
import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { Request } from 'express'

export const Cookies = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>()
  const cookies: Record<RequestCookieKeys, string> = request.cookies
  return cookies
})
