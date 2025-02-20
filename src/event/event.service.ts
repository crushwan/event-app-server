import { PrismaService } from "prisma/Prisma.service";
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { Prisma, Event } from "@prisma/client";
import * as bcrypt from 'bcrypt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EventService {
  private supabase: SupabaseClient;

  constructor(
    private readonly configService: ConfigService,
    private prisma: PrismaService) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') ?? '',
      this.configService.get<string>('SUPABASE_KEY') ?? ''
    );

  }

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
        startDate: new Date(eventData.startDate),
        endDate: new Date(eventData.endDate),
        user: { connect: { id: createdBy } }, // Correctly linking the user
      },
    });
  }

  // async update(id: string, updateData: Prisma.EventUpdateInput): Promise<Event | null> {
  //   return this.prisma.event.update({
  //     where: { id },
  //     data: updateData,
  //   });
  // }

  async update(id: string, updateData: Prisma.EventUpdateInput): Promise<Event> {
    const existingEvent = await this.findOne(id);
    if (!existingEvent) throw new NotFoundException('Event not found');

    //  Check if a new poster is provided and different from the existing one
    if (
      updateData.posterUrl &&
      existingEvent.posterUrl &&
      updateData.posterUrl !== existingEvent.posterUrl // ⬅️ Prevent deleting the same image
    ) {
      const baseUrl = this.configService.get<string>('SUPABASE_PUBLIC_URL') ?? '';
      const oldFilePath = existingEvent.posterUrl.replace(baseUrl, '');

      if (oldFilePath) {
        const { error } = await this.supabase.storage.from('posters').remove([oldFilePath]);
        if (error) {
          console.error('Failed to delete old poster:', error.message);
        } else {
          console.log('Old poster deleted:', oldFilePath);
        }
      }
    }

    // Update event data in the database
    return this.prisma.event.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date(),
      },
    });
  }

  async delete(userId: string, eventId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new ForbiddenException('Invalid password');

    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event || event.createdBy !== userId) throw new NotFoundException('Event not found'); // Only users that created the event can delete it

    // Delete the event poster from Supabase (if exists)
    if (event.posterUrl) {
      const baseUrl = this.configService.get<string>('SUPABASE_URL') + '/storage/v1/object/public/posters/';
      const filePath = event.posterUrl.replace(baseUrl, '');

      const { error } = await this.supabase.storage.from('posters').remove([filePath]);
      if (error) {
        console.error('Failed to delete image from Supabase:', error.message);
      }
    }

    return this.prisma.event.delete({ where: { id: eventId } });
  }

}

