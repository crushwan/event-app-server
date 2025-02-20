import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { EventService } from './event/event.service';
import { EventController } from './event/event.controller';
import { PrismaService } from "prisma/Prisma.service";
import { AuthModule } from "./auth/auth.module";
import { EventModule } from "./event/event.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    AuthModule,
    EventModule,
  ],
  providers: [PrismaService],
})
export class AppModule { }
