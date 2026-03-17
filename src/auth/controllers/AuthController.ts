import { Request, Response } from "express";
import { container } from "tsyringe";
import { AuthService } from "../services/AuthService";

class AuthController {
  generateToken(request: Request, response: Response): Response {
    const {email} = request.body;

    if (!email) {
      return response.status(400).json({ error: "email é obrigatório" });
    }

    const authService = container.resolve(AuthService);
    const token = authService.generateToken(email);

    return response.status(200).json({ token });
  }
}

export { AuthController };
