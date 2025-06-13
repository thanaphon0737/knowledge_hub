import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import "dotenv/config";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      }; // Define the type of user if needed
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.access_token;

  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, jwtSecret as string);
    req.user = {
      id: (decoded as any).userId, // Assuming the token contains userId
      email: (decoded as any).email, // Assuming the token contains email
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
};
