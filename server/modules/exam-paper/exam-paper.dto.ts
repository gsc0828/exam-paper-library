import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DIFFICULTIES, PAPER_TYPES } from '@shared/api.interface';

export class PaperListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsUUID()
  collegeId?: string;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsUUID()
  subjectId?: string;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsIn(DIFFICULTIES)
  difficulty?: 'easy' | 'medium' | 'hard';

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  academicYear?: string;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  semester?: string;

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsIn(PAPER_TYPES)
  paperType?: 'final' | 'midterm' | 'quiz' | 'makeup';

  @IsOptional()
  @Transform(({ obj, key, value }) =>
    obj[key as string] === '' ? undefined : value,
  )
  @IsString()
  @IsIn(['newest', 'popular', 'downloads'])
  sortBy?: 'newest' | 'popular' | 'downloads';
}

export class PaperSearchQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @IsOptional()
  @IsString()
  q?: string;
}

export class PaperHotQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class PaperRecentQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
