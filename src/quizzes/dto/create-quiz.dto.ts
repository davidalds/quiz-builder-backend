import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'

export class CreateAnswerDto {
  @IsOptional()
  @IsNumber({}, { message: 'Identificado da resposta deve ser numérico.' })
  id?: number

  @IsNotEmpty({ message: 'Título da resposta é obrigatório.' })
  @IsString({ message: 'Título da resposta deve ser textual.' })
  @MaxLength(150, { message: 'Resposta deve ter no máximo 150 caracteres.' })
  text: string

  @IsNotEmpty({ message: 'Campo IsCorrect é obrigatório.' })
  @IsBoolean({ message: 'Campo IsCorrect deve ser booleano.' })
  isCorrect: boolean
}

export class CreateQuestionDto {
  @IsOptional()
  @IsNumber({}, { message: 'Identificador da questão deve ser numérico.' })
  id?: number

  @IsNotEmpty({ message: 'Título da questão é obrigatório.' })
  @IsString({ message: 'Título da questão deve ser textual.' })
  @MinLength(5, { message: 'Questão deve ter no mínimo 5 caracteres.' })
  @MaxLength(300, { message: 'Questão deve ter no máximo 300 caracteres.' })
  text: string

  @IsArray({ message: 'Respostas devem ser um array.' })
  @ArrayMinSize(5, { message: 'Deve conter 5 opções de resposta.' })
  @ArrayMaxSize(5, { message: 'Deve conter 5 opções de resposta.' })
  @ValidateNested({ each: true, message: 'Deve haver uma resposta válida.' })
  @Type(() => CreateAnswerDto)
  answers: CreateAnswerDto[]
}

class Category {
  @IsNotEmpty({ message: 'Categoria é obrigatória.' })
  @IsString({ message: 'Categoria deve ser textual.' })
  slug: string
}

export class CreateQuizDto {
  @IsNotEmpty({ message: 'Título do quiz é obrigatório.' })
  @IsString({ message: 'Título do quiz deve ser textual.' })
  @MinLength(3, { message: 'Título do quiz deve ter no mínimo 3 caracteres.' })
  @MaxLength(100, {
    message: 'Título do quiz deve ter no máximo 100 caracteres.',
  })
  title: string

  @IsNotEmpty({ message: 'Descrição do quiz é obrigatório.' })
  @IsString({ message: 'Descrição deve ser textual.' })
  @MinLength(10, { message: 'Descrição deve ter no mínimo 10 caracteres.' })
  @MaxLength(500, { message: 'Descrição deve ter no máximo 500 caracteres.' })
  description: string

  @IsArray({ message: 'Categorias deve ser uma lista.' })
  @ArrayMinSize(1, { message: 'Quiz deve conter no mínimo 1 categoria.' })
  @ValidateNested({ each: true, message: 'Dever haver uma categoria válida.' })
  @Type(() => Category)
  categories: Category[]

  @IsArray({ message: 'Questões deve ser uma lista.' })
  @ArrayMinSize(1, { message: 'Quiz deve conter no mínimo 1 questão.' })
  @ValidateNested({ each: true, message: 'Deve haver uma questão válida.' })
  @Type(() => CreateQuestionDto)
  questions: CreateQuestionDto[]
}
