import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.MSH_JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      usuario: payload.usuario,
      proyecto: payload.proyecto,
      rol: payload.rol,
      numeroCliente: payload.numeroCliente,
      correo: payload.correo,
      jwtCreated: payload.iat,
      jwtExpire: payload.exp,
    };
  }
}
