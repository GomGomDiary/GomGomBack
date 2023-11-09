import { IsNotEmpty, IsString } from 'class-validator';

// TODO 중복
export class CountersignPostDto {
  @IsNotEmpty()
  @IsString()
  countersign: string;
}
