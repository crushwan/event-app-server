import { IsISO8601, IsString, IsOptional, IsDateString, IsNotEmpty } from "class-validator";

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
