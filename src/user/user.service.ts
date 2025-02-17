import { Injectable } from '@nestjs/common';
import { PrismaService } from './../../prisma/Prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

   // no need already handle by auth
  async createUser({password,email, name}: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });
  }

  async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
