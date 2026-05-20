import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateUserDto {
  @IsNotEmpty({ message: 'E-mail é obrigatório.' })
  @IsEmail({}, { message: 'E-mail deve ser válido.' })
  email: string

  @IsNotEmpty({ message: 'Nome de usuário é obrigatório.' })
  @IsString({ message: 'Nome de usuário deve ser textual.' })
  @MinLength(5, {
    message: 'Nome de usuário deve ter no mínimo 5 caracteres.',
  })
  @MaxLength(50, {
    message: 'Nome de usuário deve ter no máximo 50 caracteres.',
  })
  name: string

  @IsNotEmpty({ message: 'Senha é obrigatória.' })
  @IsString({ message: 'Senha deve ser textual.' })
  @MinLength(5, { message: 'Senha deve ter no mínimo 5 caracteres.' })
  password: string
}
