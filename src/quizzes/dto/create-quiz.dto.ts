import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

export class CreateAnswerDto {
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser numérico.' })
  id?: number

  @IsString({ message: 'Valor deve ser string.' })
  text: string

  @IsBoolean()
  isCorrect: boolean
}

export class CreateQuestionDto {
  @IsOptional()
  @IsNumber({}, { message: 'Valor deve ser numérico.' })
  id?: number

  @IsString({ message: 'Valor deve ser string.' })
  text: string

  @IsArray({ message: 'Valor deve ser um array.' })
  @ArrayMinSize(5, { message: 'Deve conter 5 opções de resposta.' })
  @ArrayMaxSize(5, { message: 'Deve conter 5 opções de resposta.' })
  @ValidateNested({ each: true, message: 'Deve haver uma resposta válida.' })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[]
}

export class CreateQuizDto {
  @IsString({ message: 'Valor deve ser string.' })
  title: string

  @IsString({ message: 'Valor deve ser string.' })
  description: string

  @IsArray({ message: 'Valor deve ser um array.' })
  @ArrayMinSize(1, { message: 'Quiz deve conter no mínimo 1 questão.' })
  @ValidateNested({ each: true, message: 'Deve haver uma questão válida.' })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[]
}
