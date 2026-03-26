import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthUser } from "../types/user";

export interface CustomRequest extends Request {
  user?: AuthUser;
}

export const verifyToken = (
  req: CustomRequest,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(403).json({ error: "Access denied. Token missing." });
  }

  try {
    const secret = process.env.JWT_SECRET as string;

    // Verify and cast the decoded object to our AuthUser type
    const decoded = jwt.verify(token, secret) as AuthUser;

    // Now 'req.user' is type-safe!
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
};
