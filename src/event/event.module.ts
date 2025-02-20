import { Module } from '@nestjs/common';
import { EventService } from './event.service';
import { EventController } from './event.controller';
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "prisma/Prisma.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [PrismaModule, ConfigModule, AuthModule],
  controllers: [EventController],
  providers: [EventService]
})
export class EventModule { }
