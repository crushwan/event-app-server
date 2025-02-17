import { Global, Module } from '@nestjs/common';
import { PrismaService } from './Prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // 👈 Make it available to other modules
})
export class PrismaModule {}
