import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AnswerPostDto {
  @IsNotEmpty()
  @IsArray()
  answers: string[];

  @IsNotEmpty()
  @IsString()
  answerer: string;
}
