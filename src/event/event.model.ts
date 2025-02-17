export class Event {
  id: string; 
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  status?: "Ongoing" | "Completed" | null;
  posterUrl?: string | null; 
  createdBy: string; 
  user?: any;
}
