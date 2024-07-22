import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmAseguradoraService } from 'src/modules/administracion/domain/services/adm.aseguradora.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { BitActividadService } from 'src/modules/bitacora/domain/services/bit.actividad.service';
import { CatRiesgoService } from 'src/modules/catalogo/domain/services/cat.riesgo.service';
import { CatTipoMovimientoService } from 'src/modules/catalogo/domain/services/cat.tipo-movimiento.service';
import { CatUnidadService } from 'src/modules/catalogo/domain/services/cat.unidad.service';
import { CoreInformacionContactoRepository } from '../../persistence/repository/core.informacion-contacto.repository';
import { CoreTitularRepository } from '../../persistence/repository/core.titular.repository';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CorePolizaRepository } from '../../persistence/repository/core.poliza.repository';
import { WorkflowActividadService } from 'src/modules/workflow/domain/services/workflow.actividad.service';
import { DefaultResponse } from 'src/app/common/response/default.response';

@Controller()
export class CoreInformacionContactoService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly admAseguradoraService: AdmAseguradoraService,
    private readonly admProyectoService: AdmProyectoService,
    private readonly bitActividadService: BitActividadService,
    private readonly catUnidadService: CatUnidadService,
    private readonly catTipoMovimientoService: CatTipoMovimientoService,
    private readonly catRiesgoService: CatRiesgoService,
    private readonly coreInformacionContactoRepository: CoreInformacionContactoRepository,
    private readonly coreTitularRepository: CoreTitularRepository,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly corePolizaRepository: CorePolizaRepository,
    private readonly workflowActividadService: WorkflowActividadService,

  ) { }

  //FIXME: RMQServices_Core.INFORMACION_CONTACTO.findEmailsByNumeroCliente
  async findEmailsByNumeroCliente(payload: {
    body: { numeroCliente: string; correoElectronico: string };
    lang: string;
  }): Promise<ResponseDto> {

    const titular: any =
      await this.coreTitularRepository.findOneByNumeroCliente(
        payload.body.numeroCliente,
      );

    if (!titular) return DefaultResponse.sendOk('', { emails: [] });

    const folios: any[] = await this.coreFolioRepository.findAllByTitular(
      titular._id,
    );

    if (folios.length === 0) return DefaultResponse.sendOk('', { emails: [] });

    const contactos =
      await this.coreInformacionContactoRepository.findManyByFolios(
        folios.map((f) => new Types.ObjectId(f._id)),
      );

    const foliosTitular =
      await this.coreFolioRepository.findPortalAseguradoByTitular(titular._id);

    if (foliosTitular == null) return DefaultResponse.sendOk('', []);

    const folioFilter = [
      ...new Set(foliosTitular.map(({ _id }) => _id.toString())),
    ];

    const folioMultisistema = [
      ...new Set(
        foliosTitular.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      folioFilter,
    );

    const aseguradoraFiltroIds = [
      ...new Set(folioPolizas.map(({ aseguradora }) => aseguradora.toString())),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      catUnidad,
      catTipoMovimiento,
      catRiesgo,
      actividadesWF,
      proyecto,
    ] = await Promise.all([
      this.admAseguradoraService.selectIn(aseguradoraFiltroIds),
      this.bitActividadService.selectInByFoliosBandeja(folioFilter),
      this.catUnidadService.select(),
      this.catTipoMovimientoService.select(),
      this.catRiesgoService.select(),
      this.workflowActividadService.findUltimaActividadByFolio({
        folioMultisistema: <any>folioMultisistema, //REVIEW
      }),
      this.admProyectoService.findAll({ lang: payload.lang }),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const aseguradora = aseguradoras.find((a) => a._id.equals(x.aseguradora));
      return {
        _id: x.folio,
        aseguradora: aseguradora.nombreComercial,
        _idAseguradora: aseguradora._id,
        unidad: x.unidad,
        riesgo: x.riesgo,
      };
    });

    const contratos = actividadesWF.data.map((x) => {
      const folio = foliosTitular.find(
        (b: any) => b.folioMultisistema === x.actividades.folioMultisistema,
      );

      const { actividades } = actividadesBitacora.find(
        (b: any) => b.actividades.folio.toString() === folio._id.toString(),
      );

      const { aseguradora, _idAseguradora, unidad, riesgo } = riesgoFolios.find(
        (r) => r._id.toString() === folio._id.toString(),
      );

      const _unidad = catUnidad.data.find(
        (r) => r.clave === unidad,
      )?.descripcion;

      const _riesgo = catRiesgo.data.find(
        (r) => r.clave === riesgo,
      )?.descripcion;

      const _tipoMovimiento = catTipoMovimiento.data.find(
        (r) => r.clave === folio.tipoMovimiento,
      )?.descripcion;

      const _pais = proyecto.data.find(
        (r) => r._id === folio.proyecto.toString(),
      )?.pais?.clave;

      return {
        folio: folio._id,
        folioMultisistema: folio.folioMultisistema,
        aseguradora,
        estado: actividades.estatusBitacora,
        aseguradoraId: _idAseguradora,
        unidad: _unidad,
        riesgo: _riesgo,
        tipoMovimiento: _tipoMovimiento,
        estatus: x.actividades.estatus,
        actividad: actividades.actividad,
        pais: _pais,
        titular: folio.titular,
        proyecto: folio.proyecto,
      };
    });

    return DefaultResponse.sendOk('', {
      emails: contactos.flatMap((c) => c.correos),
      titular,
      contratos: contratos,
      contactos: contactos,
    });
  }
}
