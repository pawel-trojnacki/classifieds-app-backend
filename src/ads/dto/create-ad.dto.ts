import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { allowedPrice } from '../../shared/constants/allowed-price';

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
  @IsNumber()
  @Min(allowedPrice.min)
  @Max(allowedPrice.max)
  @Type(() => Number)
  price: number;

  @IsString()
  @Length(10, 400)
  description: string;
}
