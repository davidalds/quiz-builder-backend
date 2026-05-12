import { IsEnum } from 'class-validator'

enum Status {
  PUBLICO = 'PUBLICO',
  PRIVADO = 'PRIVADO',
  NAO_LISTADO = 'NAO_LISTADO',
}

export class QuizStatusDto {
  @IsEnum(Status)
  status: Status
}
