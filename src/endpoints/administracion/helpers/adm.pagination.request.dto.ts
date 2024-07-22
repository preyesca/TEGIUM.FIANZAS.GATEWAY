import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class AdmPaginationRequestDto {
  @IsOptional()
  @IsString()
  term?: string;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(0, { message: 'offset debe ser mayor o igual que 0' })
  offset?: number;

  @Type(() => Number)
  @IsInt()
  @IsOptional()
  @Min(1, { message: 'limit debe ser mayor o igual que 1' })
  limit?: number;

  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsOptional()
  @IsBoolean()
  isFinished?: boolean;
}
