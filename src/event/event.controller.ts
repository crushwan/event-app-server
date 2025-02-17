import {
  Controller,
  Get,
  Query,
  Param,
  Patch,
  Body,
  NotFoundException,
  Post,
  UseGuards, Req,
  Request,
  Delete
} from "@nestjs/common";
import { EventService } from "./event.service";
import { Prisma, Event } from "@prisma/client";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RequestWithUser } from "src/auth/types/request-with-user";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

@Controller("events")
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Get()
  async getEvents(
    @Query("page") page = 1,
    @Query("limit") limit = 5,
    @Query("search") search?: string,
    @Query("status") status?: string
  ) {
    return this.eventService.getFilteredEvents({ page, limit, search, status });
  }

  @Get(":id")
  async getEvent(@Param("id") id: string): Promise<Event> {
    const event = await this.eventService.findOne(id);
    if (!event) throw new NotFoundException("Event not found");
    return event;
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req: RequestWithUser, @Body() eventData: CreateEventDto) {
    const createdBy = req.user.id; // Extract `userId` from logged-in user
    console.log("Received event data:", eventData); // Debugging line
    console.log("Event ID:", createdBy);
    return this.eventService.create(createdBy, eventData);
  }

  @Patch(":id")
  async updateEvent(
    @Param("id") id: string,
    @Body() updateData: UpdateEventDto
  ): Promise<Event> {
    const updatedEvent = await this.eventService.update(id, updateData);
    if (!updatedEvent) throw new NotFoundException("Event not found");
    return updatedEvent;
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteEvent(
    @Req() req: RequestWithUser,
    @Param('id') eventId: string,
    @Body() { password }: { password: string }
  ) {
    const userId = req.user.id; // Extract `userId` from logged-in user
    return this.eventService.delete(userId, eventId, password);
  }
}
