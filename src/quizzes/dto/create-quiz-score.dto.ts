import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  ValidateNested,
} from 'class-validator'

class userAnswer {
  @IsNumber({}, { message: 'Valor tem que ser numérico.' })
  questionId: number
  @IsNumber({}, { message: 'Valor tem que ser numérico.' })
  answerId: number
}

export class CreateQuizScoreDto {
  @IsArray({ message: 'Valor tem que ser um array.' })
  @ArrayMinSize(1, { message: 'Deve ter pelo menos uma resposta marcada.' })
  @ValidateNested({ each: true, message: 'Valor deve ser válido.' })
  @Type(() => userAnswer)
  userAnswers: userAnswer[]
}
