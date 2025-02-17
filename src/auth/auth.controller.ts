import { Controller, Post, Body, Res, UnauthorizedException, Req, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from "./dto/login.dto";
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  // @Post('login')
  // login(@Body() loginDto :LoginDto ) {
  //   return this.authService.login(loginDto);
  // }

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);

    console.log("Generated Access Token:", accessToken);
    console.log("Generated Refresh Token:", refreshToken);


    // Set refresh token in HttpOnly cookie (Cannot be accessed via JS)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      // secure: true, // Only for HTTPS
      secure: false, // ❌ Set to true only in production with HTTPS
      // secure: process.env.NODE_ENV === 'production'
      // sameSite: "strict",
      sameSite: 'lax', // or 'None' for cross-origin requests in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
    });

    return res.json({ accessToken });
  }

  // @Post("refresh-token")
  // async refreshToken(@Body("refreshToken") refreshToken: string) {
  //   if (!refreshToken) {
  //     throw new BadRequestException("Refresh token missing");
  //   }
  //   return this.authService.refreshToken(refreshToken);
  // }

  @Post("refresh-token")
  async refreshToken(@Req() req: Request) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new BadRequestException("Refresh token missing");
    }
    return this.authService.refreshToken(refreshToken);
  }

}
