import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateAuthDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  @IsEmail({}, { message: 'E-mail deve ser válido.' })
  email: string

  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @IsString({ message: 'Senha deve ser textual.' })
  password: string
}
