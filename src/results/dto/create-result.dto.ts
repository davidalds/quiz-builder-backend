import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator'

class userAnswer {
  @IsNumber({}, { message: 'Identificador da questão deve ser numérico.' })
  questionId: number
  @IsNumber({}, { message: 'Identificador da resposta deve ser numérico.' })
  answerId: number
}

export class CreateResultDto {
  @IsArray({ message: 'Respostas do usuário deve ser uma lista.' })
  @ArrayMinSize(1, { message: 'Deve ter pelo menos uma resposta marcada.' })
  @ValidateNested({
    each: true,
    message: 'Respostas do usuário devem ser válidas.',
  })
  @Type(() => userAnswer)
  userAnswers: userAnswer[]
}
