import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { ENotificacion } from 'src/app/common/enum/notificaciones.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
//import { NotificacionService } from '../notificacion/notificacion.service';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { AdmAseguradoraService } from 'src/modules/administracion/domain/services/adm.aseguradora.service';
import { AdmConfiguracionDocumentalService } from 'src/modules/administracion/domain/services/adm.configuracion-documental.service';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { BitActividadService } from 'src/modules/bitacora/domain/services/bit.actividad.service';
import { BitActividadRepository } from 'src/modules/bitacora/persistence/repository/bit.actividad.repository';
import { CatRiesgoService } from 'src/modules/catalogo/domain/services/cat.riesgo.service';
import { CatTipoMovimientoService } from 'src/modules/catalogo/domain/services/cat.tipo-movimiento.service';
import { CatUnidadService } from 'src/modules/catalogo/domain/services/cat.unidad.service';
import { ExpArchivoService } from 'src/modules/expediente/domain/services/exp.archivo.service';
import { WorkflowDto } from 'src/modules/workflow/domain/dto/workflow.dto';
import { WorkflowService } from 'src/modules/workflow/domain/services/workflow.service';
import { CoreInformacionContactoRepository } from '../../persistence/repository/core.informacion-contacto.repository';
import { CoreTitularRepository } from '../../persistence/repository/core.titular.repository';
import { FlowFirmaClienteRepository } from '../../persistence/repository/flows/flow.firma-cliente.repository';
import { FlowFirmaClienteDto } from '../helpers/dto/flows/flow.firma-cliente.dto';
import { CoreFolioRepository } from './../../persistence/repository/core.folio.repository';
import { CorePolizaRepository } from './../../persistence/repository/core.poliza.repository';
import { CoreComentarioService } from './core.comentario.service';
import { CoreNotificacionService } from './core.notificacion.service';
import { CatMotivoRechazoService } from 'src/modules/catalogo/domain/services/cat.motivo-rechazo.service';
import { EComentario } from '../helpers/enum/core.comentario';
//import { FirmaClienteService } from '../firma-cliente/firma-cliente.service';
//import { FirmaClienteDTO } from '../firma-cliente/dto/firma-cliente.dto';

@Controller()
export class CorePortalAseguradoService {
  constructor(
    private i18nContext: I18nService<I18nTranslations>,
    private readonly informacionContactoService: CoreInformacionContactoRepository,
    private readonly titularService: CoreTitularRepository,
    private readonly folioService: CoreFolioRepository,
    private readonly polizaService: CorePolizaRepository,
    private readonly expService: ExpArchivoService,
    private readonly confDocumentalService: AdmConfiguracionDocumentalService,
    private readonly workflowService: WorkflowService,
    private readonly bitActividadService: BitActividadService,
    private readonly aseguradoraService: AdmAseguradoraService,
    private readonly catUnidadService: CatUnidadService,
    private readonly catTipoMovimientoService: CatTipoMovimientoService,
    private readonly catRiesgoService: CatRiesgoService,
    private readonly admProyectoService: AdmProyectoService,
    private readonly bitacoraRepository: BitActividadRepository,
    private readonly flowFirmaClienteRepository: FlowFirmaClienteRepository,
    private readonly coreNotificacionService: CoreNotificacionService,
    private readonly comentarioRepository: CoreComentarioService,
    private readonly motivoService: CatMotivoRechazoService,
  ) { }

  async findInformacionTitular(payload: any, lang: string) {
    const data = await this.expService.GetConfiguracionMasiva({
      session: '',
      pais: payload.pais,
      aseguradora: payload.aseguradora,
      proyecto: payload.proyecto,
      titular: payload.titular,
      lang: lang,
    });

    const configuracion =
      await this.confDocumentalService.getConfiguracionDocumental({
        proyecto: payload.proyecto,
        aseguradora: payload.aseguradora,
        titular: payload.titular,
        lang: lang,
      });

    const motivos: any = await this.motivoService.select();

    return DefaultResponse.sendOk('', {
      documentos: data,
      configuracion: configuracion.data,
      motivos: motivos.data,
    });
  }

  async avanzarPortal(
    workflow: WorkflowDto,
    session: SessionTokenDto,
    i18n: I18nContext,
  ) {
    const workflowResult = await this.workflowService.iniciarPortal({
      session,
      workflow,
      lang: i18n.lang,
    });

    if (!workflowResult.success) return workflowResult;

    const bitacora = await this.bitacoraRepository.create({
      folio: new Types.ObjectId(workflow.folio),
      actividad: workflow.actividadFinal,
      usuario: null,
      estatusBitacora: workflow.actividad,
      comentario: '',
    });

    await this.comentarioRepository.create({
      data: {
        folio: new Types.ObjectId(workflow.folio),
        bitacora: bitacora._id,
        comentarios: EComentario.BITACORA_TRANSICION,
        actividad: workflow.actividadFinal,
      },
      lang: i18n.lang,
    });

    await this.comentarioRepository.create({
      data: {
        folio: new Types.ObjectId(workflow.folio),
        bitacora: bitacora._id,
        comentarios: EComentario.AVANZADO_DESDE_PORTAL,
        actividad: workflow.actividadFinal,
      },
      lang: i18n.lang,
    });

    if (workflow.notificacion == ENotificacion.REVISION_DOCUMENTAL) {
      this.coreNotificacionService.revision(i18n, session, '', workflow);
    }

    if (workflow.notificacion == ENotificacion.SOLICITUD_FIRMA_EJECUTIVO) {
      this.coreNotificacionService.solicitudfirmaEjecutivo(
        i18n,
        session,
        '',
        workflow,
      );
    }

    if (workflow.notificacion == ENotificacion.FISICOS_ENVIADOS) {
      this.coreNotificacionService.fisicosEnviados(i18n, session, '', workflow);
    }

    if (workflow.notificacion == ENotificacion.RECEPCION_DOCUMENTOS) {
      this.coreNotificacionService.recepcionDocumentos(i18n, session, '', workflow);
    }

    return DefaultResponse.sendOk('', workflowResult.data);
  }

  async findContractos(payload: any, lang: string) {
    const folios = await this.folioService.findPortalAseguradoByTitular(
      payload._id,
    );

    if (folios == null) return DefaultResponse.sendOk('', []);

    const folioFilter = [...new Set(folios.map(({ _id }) => _id.toString()))];
    const folioMultisistema = [
      ...new Set(folios.map(({ folioMultisistema }) => folioMultisistema)),
    ] as number[];
    const folioPolizas = await this.polizaService.selectInByFolio(folioFilter);
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
      //  proyecto
    ] = await Promise.all([
      /* lastValueFrom(
        this._clientProxyAdministracion.send(
          RMQServices_Administracion.ASEGURADORA.selectIn,
          aseguradoraFiltroIds,
        ),
      ), */
      this.aseguradoraService.selectIn(aseguradoraFiltroIds),
      /* lastValueFrom(
        this._clientProxyBitacora.send(
          RMQServices_Bitacora.ACTIVIDAD.inByFoliosBandeja,
          folioFilter,
        ),
      ), */
      this.bitActividadService.selectInByFoliosBandeja(folioFilter),
      /* lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.UNIDAD.select,
          {},
        ),
      ), */
      this.catUnidadService.select(),
      /* lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.TIPO_MOVIMIENTO.select,
          {},
        ),
      ), */
      this.catTipoMovimientoService.select(),
      /* lastValueFrom(
        this._clientProxyCatalogo.send(
          RMQServices_Catalogo.RIESGO.select,
          {},
        ),
      ), */
      this.catRiesgoService.select(),
      /* lastValueFrom(
        this._clienteProxyWorkflow.send(
          RMQServices_WorkFlow.ACTIVIDAD.findUltimaActividadAndFolio,
          { folioMultisistema },
        ),
      ), */
      //this.workflowService.findUltimaActividadByFolio({ folioMultisistema }),
      /* lastValueFrom(
        this._clientProxyAdministracion.send(
          RMQServices_Administracion.PROYECTO.findAll,
          {},
        ),
      ), */
      this.admProyectoService.findAll({}),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const { _id, nombreComercial } = aseguradoras.find(
        (a: any) => a._id === x.aseguradora.toString(),
      );
      return {
        _id: x.folio,
        aseguradora: nombreComercial,
        _idAseguradora: _id,
        unidad: x.unidad,
        riesgo: x.riesgo,
      };
    });

    const contratos = actividadesWF.data.map((x) => {
      const folio = folios.find(
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
      //const _pais = proyecto.data.docs.find((r) => r._id === folio.proyecto.toString())?.pais?.clave;

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
        //pais: _pais,
        titular: folio.titular,
        proyecto: folio.proyecto,
      };
    });

    return DefaultResponse.sendOk('', {
      contratos: contratos,
    });
  }

  async findOneToEditFirmaCliente(payload: {
    id: string;
    lang: string;
  }): Promise<ResponseDto> {
    const dataValidacion = await this.flowFirmaClienteRepository.findOne(
      payload.id,
    );
    return DefaultResponse.sendOk('', dataValidacion);
  }

  async create(payload: {
    body: FlowFirmaClienteDto;
    lang: string;
  }): Promise<ResponseDto> {
    payload.body.folio = new Types.ObjectId(payload.body.folio);
    const created = await this.flowFirmaClienteRepository.create(payload.body);

    return DefaultResponse.sendOk(
      this.i18nContext.translate('all.MESSAGES.SUCCESS.SAVED', {
        lang: payload.lang,
      }),
      created,
    );
  }

  async update(payload: { id: any; data: FlowFirmaClienteDto; lang: string }) {
    payload.id.id = new Types.ObjectId(payload.id.id);
    payload.data.folio = new Types.ObjectId(payload.data.folio);
    const updated = await this.flowFirmaClienteRepository.update(
      payload.id.id,
      payload.data,
    );

    return DefaultResponse.sendOk(
      this.i18nContext.translate('all.MESSAGES.SUCCESS.UPDATED'),
      updated,
    );
  }
}
