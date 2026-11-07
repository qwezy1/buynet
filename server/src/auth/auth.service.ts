import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface AuthResponse {
  token: string;
  user: { id: number; email: string; name: string };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existing = await this.users.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.users.save(
      this.users.create({ email: dto.email, name: dto.name, passwordHash }),
    );
    return this.buildResponse(user);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.users.findOne({ where: { email: dto.email } });
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    return this.buildResponse(user);
  }

  private buildResponse(user: User): AuthResponse {
    const token = this.jwt.sign({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }
}
