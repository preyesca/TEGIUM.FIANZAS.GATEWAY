import {
    IsBoolean,
    IsInt,
    IsOptional,
    IsPositive,
    IsString,
    Min,
  } from 'class-validator';
  
  export class PaginationDto {
    @IsOptional()
    @IsString()
    term?: string;
  
    @IsInt()
    @IsOptional()
    @Min(0, { message: 'offset debe ser mayor o igual que 0' })
    offset?: number;
  
    @IsInt()
    @IsOptional()
    @Min(1, { message: 'limit debe ser mayor o igual que 1' })
    limit?: number;
  
    @IsOptional()
    @IsBoolean()
    isFinished?: boolean;
  }
  