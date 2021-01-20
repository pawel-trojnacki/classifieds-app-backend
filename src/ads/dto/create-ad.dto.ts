import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateAdDto {
  @IsString()
  @Length(5, 40)
  title: string;

  @IsNotEmpty()
  @IsString()
  category: string;

  @IsNotEmpty()
  @IsString()
  state: 'used' | 'new';

  @IsNotEmpty()
  @IsString()
  price: string;

  @IsString()
  @Length(10, 400)
  description: string;
}
