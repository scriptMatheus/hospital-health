import { injectable } from "tsyringe";
import { generateToken } from "../../utils/authenticateRequest";

@injectable()
class AuthService {
  generateToken(value: string): string {
    return generateToken(value);
  }
}

export { AuthService };
