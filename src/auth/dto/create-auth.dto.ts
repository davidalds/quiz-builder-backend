import { IsEmail, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsString({ message: 'Valor deve ser string.' })
  @IsEmail({}, { message: 'Valor deve ser um e-mail válido.' })
  email: string

  @IsString({ message: 'Valor deve ser string' })
  password: string
}
