import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { PrismaModule } from './../../prisma/Prisma.module';


@Module({
  imports: [
    // PrismaModule,
    ConfigModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('ACCESS_TOKEN_SECRET'),
        signOptions: { expiresIn: '15m' }, // Access token expires in 15 minutes
      }),
    }),
  ],
  providers: [AuthService, UserService], // Include UserService
  controllers: [AuthController],
  exports: [AuthService, JwtModule]
})
export class AuthModule { }