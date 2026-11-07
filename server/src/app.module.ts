import { Controller, Get, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildTypeOrmOptions } from './database/database.config';
import { AuthModule } from './auth/auth.module';
import { ListingsModule } from './listings/listings.module';
import { CategoriesModule } from './categories/categories.module';
import { Public } from './auth/jwt-auth.guard';

@Controller()
export class HealthController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: 'buynet-api', time: new Date().toISOString() };
  }
}

@Module({
  imports: [
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    AuthModule,
    ListingsModule,
    CategoriesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
