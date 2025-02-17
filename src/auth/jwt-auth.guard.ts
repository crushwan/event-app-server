import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('Access denied');

    try {
      request.user = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
      console.log("Decoded JWT Payload:", request.user); // Log the JWT payload
      return true;
    } catch (err) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email }; // Attach user data to `req.user`
  }
}
