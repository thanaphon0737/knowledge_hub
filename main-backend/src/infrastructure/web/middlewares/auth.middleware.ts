import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { jwtVerify, createRemoteJWKSet } from 'jose'

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

const PROJECT_JWKS = createRemoteJWKSet(
  new URL(`${process.env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`)
)
/**
 * Verifies the provided JWT against the project's JSON Web Key Set.
 */
async function verifyProjectJWT(jwt: string) {
  return jwtVerify(jwt, PROJECT_JWKS)
}
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    res.status(401).json({ success: false, message: "No token provided" });
    return;
  }
  try {
    const { payload } = await verifyProjectJWT(token);
    req.user = {
      id: payload.sub as string,
      email: payload.email as string,
    };
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
};
