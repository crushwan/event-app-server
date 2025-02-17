import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EventService } from './event/event.service';
import { EventController } from './event/event.controller';
import { PrismaService } from "prisma/Prisma.service";

@Module({
  imports: [
    ConfigModule.forRoot(),
    JwtModule.register({ secret: process.env.JWT_SECRET, signOptions: { expiresIn: '1h' } }),
  ],
  controllers: [AuthController, EventController],
  providers: [PrismaService, AuthService, EventService, JwtAuthGuard],
})
export class AppModule {}
