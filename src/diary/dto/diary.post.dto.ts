import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class DiaryPostDto {
  @IsNotEmpty()
  @IsArray()
  question: [];

  @IsNotEmpty()
  @IsString()
  questioner: string;

  @IsNotEmpty()
  @IsString()
  challenge: string;

  @IsNotEmpty()
  @IsString()
  countersign: string;
}
