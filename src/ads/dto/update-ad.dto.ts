import { IsOptional } from 'class-validator';
import { CreateAdDto } from './create-ad.dto';

export class UpdateAdDto extends CreateAdDto {
  @IsOptional()
  filesToRemove?: string[];
}
