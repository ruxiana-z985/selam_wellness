import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreatePostDto {
  @IsString()
  circleId!: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;
}

export class ReactToPostDto {
  @IsIn(['RELATE', 'ENCOURAGED', 'THANK_YOU', 'INSPIRED'])
  type!: 'RELATE' | 'ENCOURAGED' | 'THANK_YOU' | 'INSPIRED';
}

export class CreateBookingDto {
  @IsString()
  experienceId!: string;

  @IsString()
  date!: string;

  @IsInt()
  @Min(1)
  @Max(12)
  guests!: number;

  @IsIn(['Telebirr', 'CBE Birr', 'Card'])
  payment!: 'Telebirr' | 'CBE Birr' | 'Card';
}

export class CreateJournalDto {
  @IsString()
  mood!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  energy!: number;

  @IsString()
  prompt!: string;

  @IsString()
  response!: string;
}

export class SafetyCheckDto {
  @IsString()
  content!: string;
}
