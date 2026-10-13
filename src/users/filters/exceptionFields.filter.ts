import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(HttpException)
export class ExceptionFieldsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()

    if (status === 400) {
      const data = exceptionResponse as {
        message: string[]
        error: string
        statusCode: number
      }

      response.status(status).json({ ...data, message: data.message.join(',') })
    } else {
      response.status(status).json(exceptionResponse)
    }
  }
}
