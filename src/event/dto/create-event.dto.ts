import { IsString, IsOptional, IsDateString } from "class-validator";

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  location: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  status?: "Ongoing" | "Completed" | null;

  @IsOptional()
  @IsString()
  posterUrl?: string | null;
}
