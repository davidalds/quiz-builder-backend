import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'
import { UserReq } from 'src/types/user'

export const UserDecorator = createParamDecorator(
  (_, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest<Request & { user: UserReq }>()

    return req['user']
  },
)
