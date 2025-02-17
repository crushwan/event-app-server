import { PrismaService } from "prisma/Prisma.service";
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma, Event } from "@prisma/client";
import * as bcrypt from 'bcrypt';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async getFilteredEvents({
    page = 1,
    limit = 5,
    search,
    status,
  }: {
    page: number | string;
    limit: number | string;
    search?: string;
    status?: string;
  }): Promise<{ data: Event[]; total: number }> {
    const pageNumber = Number(page) || 1;  // Ensure `page` is a valid number (default: 1)
    const limitNumber = Number(limit) || 5; // Ensure `limit` is a valid number (default: 5)
    const skip = (pageNumber - 1) * limitNumber;
  
    const whereCondition: Prisma.EventWhereInput = {};
  
    if (search) {
      whereCondition.title = { contains: search, mode: "insensitive" }; // Case-insensitive search
    }
  
    if (status) {
      whereCondition.status = status;
    }
  
    try {
      const [events, total] = await Promise.all([
        this.prisma.event.findMany({
          where: whereCondition,
          skip,
          take: limitNumber,
        }),
        this.prisma.event.count({ where: whereCondition }),
      ]);
  
      return { data: events, total };
    } catch (error) {
      console.error("Error fetching filtered events:", error);
      throw new Error("Failed to fetch events");
    }
  }  
  

  async findOne(id: string): Promise<Event | null> {
    return this.prisma.event.findUnique({
      where: { id },
    });
  }   

    async create(createdBy: string, eventData: Omit<Prisma.EventCreateWithoutUserInput, "user">): Promise<Event> {
    return this.prisma.event.create({
      data: {
        ...eventData,
        user: { connect: { id: createdBy } }, // Correctly linking the user
      },
    });
  }  

  async update(id: string, updateData: Prisma.EventUpdateInput): Promise<Event | null> {
    return this.prisma.event.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(userId: string, eventId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ForbiddenException('Invalid password');

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.createdBy  !== userId) throw new NotFoundException('Event not found');

    return this.prisma.event.delete({ where: { id: eventId } });
  }

}

