import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  BitNotificacion,
  BitNotificacionDocument,
} from '../database/bit.notificacion.shema';

@Injectable()
export class BitNotificacionRepository {
  constructor(
    @InjectModel(BitNotificacion.name)
    private readonly bitNotificacionModel: ModelExt<BitNotificacionDocument>,
  ) { }

  async create(
    session: SessionTokenDto | null,
    type: string,
    body: any,
  ): Promise<string> {
    const model = new this.bitNotificacionModel({
      usuario: session ? new Types.ObjectId(session.usuario) : null,
      proyecto: session ? new Types.ObjectId(session.proyecto) : null,
      rol: session ? new Types.ObjectId(session.rol) : null,
      type,
      body,
    });
    const created = await model.save();
    return created._id.toString();
  }

  async sent(
    idNotificacion: Types.ObjectId,
    usuario: string | null | undefined,
    response: { success: boolean; message: string },
  ): Promise<BitNotificacion> {
    const updated = await this.bitNotificacionModel
      .findByIdAndUpdate(idNotificacion, {
        $push: {
          historial: {
            usuario: usuario ? new Types.ObjectId(usuario) : null,
            fechaEnvio: new Date(),
            mensaje: response?.message,
            enviado: response?.success,
          },
        },
      })
      .lean();

    return updated;
  }
}
