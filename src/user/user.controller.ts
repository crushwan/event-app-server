import { Controller, Post, Body ,Get, UseGuards, Request} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from "./dto/create-user.dto";


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // no need already handle by auth
  @Post('register')
  async register(@Body() createUserDto:CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }
  
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return { message: 'This is a protected route', user: req.user };
  }
}

