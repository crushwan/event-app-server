import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from './../../prisma/Prisma.module';
import { AuthModule } from '../auth/auth.module'; 


@Module({
  // imports: [PrismaModule],  
  imports: [AuthModule],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}

