import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateListingDto {
  @IsString()
  @MinLength(3, { message: 'Заголовок должен быть не короче 3 символов' })
  @MaxLength(120)
  title: string;

  @IsString()
  @MinLength(10, { message: 'Описание должно быть не короче 10 символов' })
  @MaxLength(5000)
  description: string;

  @IsInt()
  @Min(0)
  @Max(999_999_999)
  price: number;

  @IsString()
  @MaxLength(80)
  city: string;

  @IsInt()
  categoryId: number;

  @IsOptional()
  @IsUrl({}, { message: 'Некорректная ссылка на изображение' })
  imageUrl?: string;
}
