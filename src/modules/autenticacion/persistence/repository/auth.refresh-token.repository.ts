import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthRefreshTokenDto } from '../../domain/dto/auth.refresh-token.dto';
import {
  AuthRefreshToken,
  AuthRefreshTokenDocument,
} from '../database/auth.refresh-token.schema';

@Injectable()
export class AuthRefreshTokenRepository {
  constructor(
    @InjectModel(AuthRefreshToken.name)
    private readonly authRefreshTokenModel: Model<AuthRefreshTokenDocument>,
  ) {}

  async create(data: AuthRefreshTokenDto) {
    const model = {
      ...data,
      usuario: new Types.ObjectId(data.usuario),
      proyecto: new Types.ObjectId(data.proyecto),
      rol: new Types.ObjectId(data.rol),
    };
    const created = new this.authRefreshTokenModel(model);
    return await created.save();
  }

  async findOne(refreshToken: string): Promise<AuthRefreshToken> {
    return await this.authRefreshTokenModel
      .findOne({ _id: new Types.ObjectId(refreshToken) })
      .exec();
  }

  async updateExpiration(id: string): Promise<AuthRefreshToken> {
    return await this.authRefreshTokenModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .exec();
  }
}
