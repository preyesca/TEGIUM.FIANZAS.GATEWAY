import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { EstatusBitacoraConsts } from 'src/app/common/consts/core/estatus-bitacora.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmAseguradoraService } from 'src/modules/administracion/domain/services/adm.aseguradora.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { CatGiroService } from 'src/modules/catalogo/domain/services/cat.giro.service';
import { CatRiesgoService } from 'src/modules/catalogo/domain/services/cat.riesgo.service';
import { CatTipoCargaService } from 'src/modules/catalogo/domain/services/cat.tipo-carga.service';
import { CatTipoMovimientoService } from 'src/modules/catalogo/domain/services/cat.tipo-movimiento.service';
import { CatUnidadService } from 'src/modules/catalogo/domain/services/cat.unidad.service';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CorePolizaRepository } from '../../persistence/repository/core.poliza.repository';
import { CoreTitularRepository } from '../../persistence/repository/core.titular.repository';
import { CoreFolioCreateDto } from '../helpers/dto/core.folio.dto';
import { BitActividadService } from 'src/modules/bitacora/domain/services/bit.actividad.service';

@Controller()
export class CoreFolioService {
  readonly DEFAULT = {
    tipoCarga: 'Individual',
    tipoMovimiento: 'Nuevo',
    giro: 'No aplica',
    bitacora: {
      actividad: 1, //'Nuevo folio',
      estatusBitacora: EstatusBitacoraConsts.ALTA_FOLIO,
    },
  };

  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly admAseguradoraService: AdmAseguradoraService,
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly admProyectoService: AdmProyectoService,
    private readonly catGiroService: CatGiroService,
    private readonly catTipoCargaService: CatTipoCargaService,
    private readonly catTipoMovimientoService: CatTipoMovimientoService,
    private readonly catRiesgoService: CatRiesgoService,
    private readonly catUnidadService: CatUnidadService,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly coreTitularRepository: CoreTitularRepository,
    private readonly corePolizaRepository: CorePolizaRepository,
    private readonly bitBitacoraService: BitActividadService,
  ) { }

  //FIXME: RMQServices_Core.FOLIO.create
  async create(payload: {
    body: CoreFolioCreateDto;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    return DefaultResponse.sendConflict('El método no está implementado.');
  }

  //FIXME: RMQServices_Core.FOLIO.findOneExists)
  async findOneExists(payload: {
    id: string;
    lang: string;
  }): Promise<ResponseDto> {
    const folio = await this.coreFolioRepository.findOneExists(payload.id);
    return folio
      ? DefaultResponse.sendOk('', folio)
      : DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.FOLIO', {
          lang: payload.lang,
        }),
      );
  }

  //FIXME: RMQServices_Core.FOLIO.findOne
  async findOne(payload: { id: string; lang: string }): Promise<ResponseDto> {
    if (!Types.ObjectId.isValid(payload.id))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const folio: any = await this.coreFolioRepository.findOne(payload.id);

    if (!folio)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.FOLIO', {
          lang: payload.lang,
        }),
      );

    const [usuario, proyecto, titular, tipoCarga, tipoMovimiento, giro] =
      await Promise.all([
        this.admUsuarioService.findOne({
          id: folio.usuario,
          lang: payload.lang,
        }),
        this.admProyectoService.findOne({
          id: folio.proyecto,
          lang: payload.lang,
        }),
        this.coreTitularRepository.findOne(folio.titular),
        this.catTipoCargaService.findOneByClave(folio.tipoCarga),
        this.catTipoMovimientoService.findOneByClave(folio.tipoMovimiento),
        this.catGiroService.findOneByClave(folio.giro),
      ]);

    folio.usuario = usuario?.data;
    folio.proyecto = proyecto?.data;
    folio.titular = titular;
    folio.tipoCarga = tipoCarga;
    folio.tipoMovimiento = tipoMovimiento;
    folio.giro = giro;

    return DefaultResponse.sendOk('', folio);
  }

  //FIXME: RMQServices_Core.FOLIO.getInfoGeneralByFolio
  async getInfoGeneralByFolio(payload: {
    folio: string;
    lang: string;
  }): Promise<ResponseDto> {

    if (!Types.ObjectId.isValid(payload.folio))
      return DefaultResponse.sendBadRequest(
        this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
          lang: payload.lang,
        }),
      );

    const folio: any = await this.coreFolioRepository.findOne(payload.folio);

    if (!folio)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.FOLIO', {
          lang: payload.lang,
        }),
      );

    const poliza = await this.corePolizaRepository.findOneByFolio(folio._id);

    if (!poliza)
      return DefaultResponse.sendNotFound(
        this.i18n.translate('core.VALIDATIONS.NOT_FOUND.POLIZA', {
          lang: payload.lang,
        }),
      );

    const [titular, aseguradora, tipoMovimiento, unidad, riesgo, bitacora]: [
      any,
      any,
      any,
      any,
      any,
      any,
    ] = await Promise.all([
      this.coreTitularRepository.findOne(folio.titular),
      this.admAseguradoraService.findOneAndGetNombreComercial(
        poliza.aseguradora.toString(),
      ),
      this.catTipoMovimientoService.findOneByClave(folio.tipoMovimiento),
      this.catUnidadService.findOneByClave(poliza.unidad),
      this.catRiesgoService.findOneByClave(poliza.riesgo),
      this.bitBitacoraService.selectLastStatusByFolio(folio._id)
    ]);

    const header = {
      folioCliente: folio.folioCliente,
      asegurado: titular?.nombre ?? '--',
      aseguradora: aseguradora?.nombreComercial ?? '--',
      tipoMovimiento: tipoMovimiento?.descripcion ?? '--',
      unidad: unidad?.descripcion ?? '--',
      riesgo: riesgo?.descripcion ?? '--',
      estatusBitacora: bitacora?.estatusBitacora ?? '--',
      fechaVigencia: poliza.fechaVigencia ?? '--',
    };

    return DefaultResponse.sendOk('', header);
  }
}
