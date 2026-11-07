import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

export const IS_PUBLIC_KEY = 'isPublic';
/** Помечает эндпоинт как публичный (глобальный guard пропустит его). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const request = ctx.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      if (isPublic) return true;
      throw new UnauthorizedException('Требуется авторизация');
    }
    try {
      request.user = await this.jwt.verifyAsync(token);
    } catch {
      if (isPublic) return true;
      throw new UnauthorizedException('Недействительный токен');
    }
    return true;
  }

  private extractToken(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
