import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function generateToken(value): string {
  return jwt.sign({ data: value }, process.env.TOKEN_SECRET as string, { expiresIn: "24h" });
}

export function authenticateRequest(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  const token = request.headers["api-key"] as string;

  if (!token) {
    response.status(401).json({ error: "🔐 falta token" });
    return;
  }

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err) => {
    if (err) {
      response.status(401).json({ error: "falha ao autenticar" });
    } else {
      next();
    }
  });
}
