import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AnswerPostDto {
  @IsNotEmpty()
  @IsArray()
  answers: [];

  @IsNotEmpty()
  @IsString()
  answerer: string;
}
