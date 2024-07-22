import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatEstatusUsuario } from '../../persistence/database/cat.estatus-usuario.schema';
import { CatEstatusUsuarioRepository } from '../../persistence/repository/cat.estatus-usuario.repository';

@Controller()
export class CatEstatusUsuarioService {
  constructor(
    private readonly catEstatusUsuarioRepository: CatEstatusUsuarioRepository,
  ) {}

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.select)
  async select(): Promise<ResponseDto> {
    const data = await this.catEstatusUsuarioRepository.select();
    return DefaultResponse.sendOk('', data);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.finOne)
  async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(id))
      return DefaultResponse.sendBadRequest(
        i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
      );

    const data = await this.catEstatusUsuarioRepository.findOne(id);
    return data
      ? DefaultResponse.sendOk('', data)
      : DefaultResponse.sendNotFound(
          i18n.t('catalogos.VALIDATIONS.NOT_FOUND.ESTATUS_USUARIO'),
        );
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.selectIn)
  async selectIn(payload: string[]): Promise<CatEstatusUsuario[]> {
    return await this.catEstatusUsuarioRepository.selectIn(payload);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.selectInByClave)
  async selectInByClave(claves: number[]): Promise<CatEstatusUsuario[]> {
    return await this.catEstatusUsuarioRepository.selectInByClave(claves);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.findOneByClave)
  async findOneByClave(clave: number): Promise<CatEstatusUsuario> {
    return await this.catEstatusUsuarioRepository.findOneByClave(clave);
  }

  //FIXME: RMQServices_Catalogo.ESTATUS_USUARIO.finOneByDescription)
  async findOneByDesription(desripcion: string): Promise<CatEstatusUsuario> {
    return await this.catEstatusUsuarioRepository.findOneByDescripcion(
      desripcion,
    );
  }
}
