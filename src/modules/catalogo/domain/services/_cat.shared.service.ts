import { Controller } from '@nestjs/common';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatCategoriaDocumentoRepository } from '../../persistence/repository/cat.categoria-documento.repository';
import { CatEstatusContactoTelefonicoRepository } from '../../persistence/repository/cat.estatus-contacto-telefonico.repository';
import { CatEstatusGeneralRepository } from '../../persistence/repository/cat.estatus-general.repository';
import { CatEstatusUsuarioRepository } from '../../persistence/repository/cat.estatus-usuario.repository';
import { CatGiroRepository } from '../../persistence/repository/cat.giro.repository';
import { CatMotivoRechazoRepository } from '../../persistence/repository/cat.motivo-rechazo.repository';
import { CatNegocioRepository } from '../../persistence/repository/cat.negocio.repository';
import { CatOficinaRepository } from '../../persistence/repository/cat.oficina.repository';
import { CatPaisRepository } from '../../persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from '../../persistence/repository/cat.perfil.repository';
import { CatProcesoRepository } from '../../persistence/repository/cat.proceso.repository';
import { CatRamoRepository } from '../../persistence/repository/cat.ramo.repository';
import { CatTipoContactoRepository } from '../../persistence/repository/cat.tipo-contacto.repository';
import { CatTipoLlamadaRepository } from '../../persistence/repository/cat.tipo-llamada.repository';
import { CatTipoPersonaRepository } from '../../persistence/repository/cat.tipo-persona.repository';

@Controller()
export class CatSharedService {
  constructor(
    private readonly catRamoRepository: CatRamoRepository,
    private readonly catPaisRepository: CatPaisRepository,
    private readonly catGiroRepository: CatGiroRepository,
    private readonly catPerfilRepository: CatPerfilRepository,
    private readonly catOficinaRepository: CatOficinaRepository,
    private readonly catProcesoRepository: CatProcesoRepository,
    private readonly catNegocioRepository: CatNegocioRepository,
    private readonly catTipoPersonaRepository: CatTipoPersonaRepository,
    private readonly catTipoLlamadaRepository: CatTipoLlamadaRepository,
    private readonly catTipoContactoRepository: CatTipoContactoRepository,
    private readonly catMotivoRechazoRepository: CatMotivoRechazoRepository,
    private readonly catEstatusUsuarioRepository: CatEstatusUsuarioRepository,
    private readonly catEstatusGeneralRepository: CatEstatusGeneralRepository,
    private readonly catCategoriaDocumentoRepository: CatCategoriaDocumentoRepository,
    private readonly catEstatusContactoTelefonicoRepository: CatEstatusContactoTelefonicoRepository,
  ) {}

  //FIXME: RMQServices_SharedCatalogo.USUARIO.getCatalogos
  async usuario_createGetCatalogos(): Promise<ResponseDto> {
    const [paises, estatus, perfiles]: [any[], any[], any[]] =
      await Promise.all([
        await this.catPaisRepository.select(),
        await this.catEstatusUsuarioRepository.select(),
        await this.catPerfilRepository.select(),
      ]);

    return DefaultResponse.sendOk('', {
      paises,
      estatus,
      perfiles,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.ASEGURADORA.getCatalogos
  async aseguradora_getCatalogos(): Promise<ResponseDto> {
    const [paises, estatus, oficinas]: [any[], any[], any[]] =
      await Promise.all([
        await this.catPaisRepository.select(),
        await this.catEstatusGeneralRepository.select(),
        await this.catOficinaRepository.select(),
      ]);

    return DefaultResponse.sendOk('', {
      paises,
      estatus,
      oficinas,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.DOCUMENTO.getCatalogos
  async documento_getCatalogos(): Promise<ResponseDto> {
    const [paises, estatus, categoriaDocumento]: [any[], any[], any[]] =
      await Promise.all([
        await this.catPaisRepository.select(),
        await this.catEstatusGeneralRepository.select(),
        await this.catCategoriaDocumentoRepository.select(),
      ]);

    return DefaultResponse.sendOk('', {
      paises,
      estatus,
      categoriaDocumento,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.FORMATO_KYC.getCatalogos
  async formatoKyc_getCatalogos(): Promise<ResponseDto> {
    const [paises, tipoPersona]: [any[], any[]] = await Promise.all([
      await this.catPaisRepository.select(),
      await this.catTipoPersonaRepository.select(),
    ]);

    return DefaultResponse.sendOk('', {
      paises,
      tipoPersona,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.PROYECTO.getCatalogos)
  async proyecto_getCatalogos(): Promise<ResponseDto> {
    const [paises, ramo, proceso, negocio, estatus]: [
      any[],
      any[],
      any[],
      any[],
      any[],
    ] = await Promise.all([
      await this.catPaisRepository.select(),
      await this.catRamoRepository.select(),
      await this.catProcesoRepository.select(),
      await this.catNegocioRepository.select(),
      await this.catEstatusGeneralRepository.select(),
    ]);

    return DefaultResponse.sendOk('', {
      paises,
      ramo,
      proceso,
      negocio,
      estatus,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.CONFIGURACION_DOCUMENTAL.getCatalogos,
  async configuracion_documental_getCatalogos(): Promise<ResponseDto> {
    const [paises, tipoPersona, giro, estatus, motivo]: [
      any[],
      any[],
      any[],
      any[],
      any[],
    ] = await Promise.all([
      await this.catPaisRepository.select(),
      await this.catTipoPersonaRepository.select(),
      await this.catGiroRepository.select(),
      await this.catEstatusGeneralRepository.select(),
      await this.catMotivoRechazoRepository.select(),
    ]);

    return DefaultResponse.sendOk('ok', {
      paises,
      tipoPersona,
      giro,
      estatus,
      motivo,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.CONTACTO_TELEFONICO.getCatalogos
  async contacto_telefonico_getCatalogos(): Promise<ResponseDto> {
    const [tipoLlamada, estatus, tipoContacto]: [any[], any[], any[]] =
      await Promise.all([
        await this.catTipoLlamadaRepository.select(),
        await this.catEstatusContactoTelefonicoRepository.select(),
        await this.catTipoContactoRepository.select(),
      ]);

    return DefaultResponse.sendOk('', {
      tipoLlamada,
      estatus,
      tipoContacto,
    });
  }

  //FIXME: RMQServices_SharedCatalogo.CONFIGURACION_ASEGURADORA.getCatalogos,
  async configuracion_aseguradora_getCatalogos(): Promise<ResponseDto> {
    const [paises, oficinas]: [any[], any[]] = await Promise.all([
      await this.catPaisRepository.select(),
      await this.catOficinaRepository.select(),
    ]);

    return DefaultResponse.sendOk('', {
      paises,
      oficinas,
    });
  }
}
