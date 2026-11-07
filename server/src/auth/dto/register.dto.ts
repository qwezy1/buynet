import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некорректный email' })
  email: string;

  @IsString()
  @MinLength(2, { message: 'Имя должно быть не короче 2 символов' })
  @MaxLength(60)
  name: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  @MaxLength(72)
  password: string;
}
