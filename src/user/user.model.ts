import { Event } from "src/event/event.model";

export class User {
  id: string;
  email: string;
  password: string;
  name?: string;
  events?: Event[]; // User can have multiple events
}
