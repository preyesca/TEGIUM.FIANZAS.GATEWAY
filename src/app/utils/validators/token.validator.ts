import { SessionTokenDto } from '../../common/dto/session-token.dto';

export class TokenValidator {
  static isValid(session: SessionTokenDto | null): boolean {
    return !(!session || !session.usuario || !session.proyecto || !session.rol);
  }
}
