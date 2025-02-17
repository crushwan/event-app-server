import { ConfigService } from '@nestjs/config';
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from "prisma/Prisma.service";
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignupDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private configService: ConfigService,
  ) { }

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new BadRequestException('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid credentials');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid credentials');

    // const payload = { id: user.id, username: user.email };
    // console.log(payload)
    // return {
    //   token: await this.jwtService.signAsync(payload),
    // };

    //  Create Access Token (short expiry)
    const accessToken = await this.jwtService.signAsync(
      { id: user.id, email: user.email },
      { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: "15m" } // 15 minutes
    );

    //  Create Refresh Token (long expiry)
    const refreshToken = await this.jwtService.signAsync(
      { id: user.id },
      { secret: process.env.REFRESH_TOKEN_SECRET, expiresIn: "7d" } // 7 days
    );

    return { accessToken, refreshToken };
  }

  async refreshToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token, { secret: process.env.REFRESH_TOKEN_SECRET });
      const user = await this.prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user) throw new BadRequestException("User not found");

      //  Generate New Access Token
      const newAccessToken = await this.jwtService.signAsync(
        { id: user.id, email: user.email },
        { secret: process.env.ACCESS_TOKEN_SECRET, expiresIn: "15m" }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw new BadRequestException("Invalid Refresh Token");
    }
  }

  // async generateTokens(user: { id: string; email: string }) {
  //   const accessToken = this.jwtService.sign(
  //     { id: user.id, email: user.email },
  //     {
  //       secret: this.ConfigService.get<string>('ACCESS_SECRET'),
  //       expiresIn: '15m',
  //     },
  //   );

  //   const refreshToken = this.jwtService.sign(
  //     { id: user.id },
  //     {
  //       secret: this.configService.get<string>('REFRESH_SECRET'),
  //       expiresIn: '7d', // Refresh token lasts 7 days
  //     },
  //   );

  //   return { accessToken, refreshToken };
  // }

  // async validateRefreshToken(refreshToken: string) {
  //   try {
  //     return this.jwtService.verify(refreshToken, {
  //       secret: this.configService.get<string>('REFRESH_SECRET'),
  //     });
  //   } catch (err) {
  //     throw new UnauthorizedException('Invalid refresh token');
  //   }
  // }
}

