import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { JwtToken } from '@/types/user'

export const UserDecorator = createParamDecorator(
  (_, context: ExecutionContext) => {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user: JwtToken }>()

    return req['user']
  },
)
