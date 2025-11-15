import { IsEmail, IsString, MinLength } from 'class-validator'

export class CreateUserDto {
  @IsString({ message: 'Valor deve ser string.' })
  @IsEmail({}, { message: 'Valor deve ser um e-mail válido.' })
  email: string

  @IsString({ message: 'Valor deve ser string.' })
  @MinLength(5, { message: 'Nome é curto demais. Mínimo 5' })
  name: string

  @IsString({ message: 'Valor deve ser string.' })
  @MinLength(5, { message: 'Senha é curta demais. Mínimo 5' })
  password: string
}
