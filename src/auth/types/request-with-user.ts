// Needed because no using passport
import { Request } from "express";

export interface RequestWithUser extends Request {
  user: { id: string; email: string };
}
