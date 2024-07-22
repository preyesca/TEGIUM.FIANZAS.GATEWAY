import { Controller } from "@nestjs/common";
import { FlowSolicitudRepository } from '../../../persistence/repository/flows/flow.solicitud.repository.';
import { SessionTokenDto } from "src/app/common/dto/session-token.dto";
import { FlowSolicitudDTO, NewFlowSolicitudDTO } from "../../helpers/dto/flows/flow.solicitud.dto";
import { ResponseDto } from "src/app/common/dto/response.dto";
import { DefaultResponse } from "src/app/common/response/default.response";
import { I18nTranslations } from "src/app/translation/translate/i18n.translate";
import { I18nContext, I18nService } from "nestjs-i18n";
import { CoreFolioRepository } from "src/modules/core/persistence/repository/core.folio.repository";
import { Types } from "mongoose";
import { CoreInformacionEjecutivoRepository } from '../../../persistence/repository/core.informacion-ejecutivo.repository';
import { CoreInformacionContactoRepository } from '../../../persistence/repository/core.informacion-contacto.repository';
import { CoreInformacionContactoDto } from "../../helpers/dto/core.informacion-contacto.dto";
import { CatTipoContactoRepository } from '../../../../catalogo/persistence/repository/cat.tipo-contacto.repository';
import { AdmAseguradoraRepository } from '../../../../administracion/persistence/repository/adm.aseguradora.repository';
import { AdmUsuarioRepository } from "src/modules/administracion/persistence/repository/adm.usuario.repository";
import { AdmProyectoRepository } from "src/modules/administracion/persistence/repository/adm.proyecto.repository";
import { CatGiroRepository } from "src/modules/catalogo/persistence/repository/cat.giro.repository";
import { CatTipoCargaRepository } from "src/modules/catalogo/persistence/repository/cat.tipo-carga.repository";
import { CatTipoMovimientoRepository } from "src/modules/catalogo/persistence/repository/cat.tipo-movimiento.repository";
import { CoreTitularRepository } from "src/modules/core/persistence/repository/core.titular.repository";
import { CoreTelefonoContactoRepository } from 'src/modules/core/persistence/repository/core.telefono-contacto.repository';
import { IFnzWorklFlow } from "src/modules/workflow/domain/dto/workflow.actividad.dto";
import { TokenValidator } from "src/app/utils/validators/token.validator";
import { WorkflowAvanzarDto } from "src/modules/workflow/domain/dto/workflow.avanzar.dto";
import { WorkflowService } from "src/modules/workflow/domain/services/workflow.service";
import { BitActividadRepository } from "src/modules/bitacora/persistence/repository/bit.actividad.repository";
import { ENotificacion } from "src/app/common/enum/notificaciones.enum";
import { EKycActividad } from "src/app/common/enum/kyc/kyc.actividad.enum";
import { CoreNotificacionService } from "../core.notificacion.service";
import { WorkflowDto } from "src/modules/workflow/domain/dto/workflow.dto";
import { CoreComentarioRepository } from "src/modules/core/persistence/repository/core.comentario.repository";
import { CoreComentarioService } from "../core.comentario.service";

@Controller()
export class FlowSolicitudService {
    constructor(
        private i18n: I18nService<I18nTranslations>,
        private readonly solicitudService: FlowSolicitudRepository,
        private readonly folioService: CoreFolioRepository,
        private readonly informacionEjecutivoService: CoreInformacionEjecutivoRepository,
        private readonly informacionContactoService: CoreInformacionContactoRepository,
        private readonly tipoContactoService: CatTipoContactoRepository,
        private readonly admAseguradora: AdmAseguradoraRepository,
        private readonly telefonoContactoService: CoreTelefonoContactoRepository,
        private readonly admUsuarioRepository: AdmUsuarioRepository,
        private readonly admProyectoRepository: AdmProyectoRepository,
        private readonly titularRepository: CoreTitularRepository,
        private readonly catTipoCargaRepository: CatTipoCargaRepository,
        private readonly catTipoMovimientoRepository: CatTipoMovimientoRepository,
        private readonly catGiroRepository: CatGiroRepository,
        private readonly workflowService: WorkflowService,
        private readonly bitacoraRepository: BitActividadRepository,
        private readonly notificacionService: CoreNotificacionService,
        private readonly coreComentarioService: CoreComentarioService


    ) { }

    async createOrUpdate(
        payload: {
            body: FlowSolicitudDTO;
            session: SessionTokenDto;
            lang: string;
        },
    ): Promise<ResponseDto> {
        if (
            !payload.session ||
            !payload.session.usuario ||
            !payload.session.proyecto ||
            !payload.session.rol
        )
            return DefaultResponse.sendUnauthorized(
                this.i18n.translate('server.JWTOKEN.ERROR', {
                    lang: payload.lang,
                }),
            );

        const folio: any = await this.folioService.findOne(
            payload.body.folio.toString(),
        );

        if (!folio)
            return DefaultResponse.sendNotFound(
                this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND', {
                    lang: payload.lang,
                }),
            );

        const solicitud: any = await this.solicitudService.findOneByFolio(
            folio._id,
        );

        const newSolicitud: NewFlowSolicitudDTO = {
            folio: new Types.ObjectId(folio._id),
            numeroUnidad: payload.body.numeroUnidad,
            fechaVigencia: payload.body.fechaVigencia,
        };

        let infoEjecutivo: any = undefined;

        //::: Información Ejecutivo

        if (payload.body.claveEjecutivo) {
            infoEjecutivo = await this.informacionEjecutivoService.findOneByNumero(
                payload.body.claveEjecutivo,
            );

            const infoEjecutivoParam = {
                proyecto: new Types.ObjectId(folio.proyecto),
                numero: payload.body.claveEjecutivo,
                nombre: payload.body.nombreEjecutivo,
            };

            infoEjecutivo = infoEjecutivo
                ? await this.informacionEjecutivoService.update(
                    infoEjecutivo._id,
                    infoEjecutivoParam,
                )
                : await this.informacionEjecutivoService.create(infoEjecutivoParam);
        }

        //::: Información Contacto

        let infoContacto: any =
            await this.informacionContactoService.findOneByFolio(folio._id);

        const infoContactoParam: CoreInformacionContactoDto = {
            folio: new Types.ObjectId(folio._id),
            nombre: payload.body.nombreContacto,
            correos: payload.body.correos,
        };

        if (payload.body.tipoContacto) {
            if (!(await this.tipoContactoService.findOne(payload.body.tipoContacto.toString())))

                return DefaultResponse.sendNotFound(
                    this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                        lang: payload.lang,
                    }),
                );

            infoContactoParam.tipo = payload.body.tipoContacto;
        }

        infoContacto = infoContacto
            ? await this.informacionContactoService.update(
                infoContacto._id,
                infoContactoParam,
            )
            : await this.informacionContactoService.create(infoContactoParam);

        newSolicitud.informacionContacto = new Types.ObjectId(infoContacto._id);

        if (infoEjecutivo)
            newSolicitud.informacionEjecutivo = new Types.ObjectId(infoEjecutivo._id);

        //::: Aseguradora

        if (payload.body.aseguradora) {
            const aseguradora: any =
                await this.admAseguradora.findOne(payload.body.aseguradora.toString())

            if (!aseguradora)
                return DefaultResponse.sendNotFound(
                    this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                        lang: payload.lang,
                    }),
                );

            newSolicitud.aseguradora = new Types.ObjectId(aseguradora._id);
        }

        //::: Telefonos contacto
        await this.telefonoContactoService.deleteMany(folio._id);

        let telefonos: Types.ObjectId[] = [];

        if (payload.body.telefonosContacto) {
            for (let i = 0; i < payload.body.telefonosContacto.length; i++) {
                const item = payload.body.telefonosContacto[i];
                const createdTelefono: any = await this.telefonoContactoService.create({
                    folio: new Types.ObjectId(folio._id),
                    telefono: item.telefono,
                    extensiones: item.extensiones,
                });

                telefonos.push(new Types.ObjectId(createdTelefono._id));
            }

            newSolicitud.telefonosContacto = telefonos;
        }

        if (solicitud) {
            const updated = await this.solicitudService.update(
                solicitud._id,
                newSolicitud,
            );

            return DefaultResponse.sendOk(
                this.i18n.translate('all.MESSAGES.SUCCESS.UPDATED', {
                    lang: payload.lang,
                }),
                updated,
            );
        }

        return DefaultResponse.sendOk(
            this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
                lang: payload.lang,
            }),
            await this.solicitudService.create(newSolicitud),
        );
    }

    async findOne(
        payload: { id: string; lang: string },
    ): Promise<ResponseDto> {
        if (!Types.ObjectId.isValid(payload.id))
            return DefaultResponse.sendBadRequest(
                this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
                    lang: payload.lang,
                }),
            );
        const solicitud: any = await this.solicitudService.findOne(payload.id);
        if (!solicitud)
            return DefaultResponse.sendNotFound(
                this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                    lang: payload.lang,
                }),
            );


        const folio: any = await this.folioService.findOne(
            solicitud.folio,
        );

        if (!folio)
            return DefaultResponse.sendNotFound(
                this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                    lang: payload.lang,
                }),
            );

        const [usuario, proyecto, titular, tipoCarga, tipoMovimiento, giro]: [
            any,
            any,
            any,
            any,
            any,
            any,
        ] = await Promise.all([
            this.admUsuarioRepository.findOne(folio.usuario),
            this.admProyectoRepository.findOne(folio.proyecto),
            this.titularRepository.findOne(folio.titular),
            this.catTipoCargaRepository.findOneByClave(folio.tipoCarga),
            this.catTipoMovimientoRepository.findOneByClave(folio.tipoMovimiento),
            this.catGiroRepository.findOneByClave(folio.giro),
        ]);

        folio.usuario = usuario?.data;
        folio.proyecto = proyecto?.data;
        folio.titular = titular;
        folio.tipoCarga = tipoCarga?.data;
        folio.tipoMovimiento = tipoMovimiento?.data;
        folio.giro = giro?.data;

        solicitud.folio = folio;

        if (solicitud.informacionContacto) {
            const infoContacto: any = await this.informacionContactoService.findOne(
                solicitud.informacionContacto,
            );

            if (!infoContacto)
                return DefaultResponse.sendNotFound(
                    this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                        lang: payload.lang,
                    }),
                );

            infoContacto.folio = undefined;
            solicitud.informacionContacto = infoContacto;
        }

        if (solicitud.informacionEjecutivo) {
            const infoEjecutivo: any = await this.informacionEjecutivoService.findOne(
                solicitud.informacionEjecutivo,
            );

            if (!infoEjecutivo)
                return DefaultResponse.sendNotFound(
                    this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                        lang: payload.lang,
                    }),
                );

            infoEjecutivo.proyecto = undefined;
            solicitud.informacionEjecutivo = infoEjecutivo;
        }

        if (solicitud.telefonosContacto) {
            let telefonos: any[] = [];
            for (let i = 0; i < solicitud.telefonosContacto.length; i++) {
                const telefono = await this.telefonoContactoService.finOne(
                    solicitud.telefonosContacto[i],
                );

                if (!telefono)
                    return DefaultResponse.sendNotFound(
                        this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                            lang: payload.lang,
                        }),
                    );

                telefono.folio = undefined;
                telefonos.push(telefono);
            }

            solicitud.telefonosContacto = telefonos;
        }

        if (solicitud.aseguradora) {
            const aseguradora: any =
                await this.admAseguradora.findOne(solicitud.aseguradora)

            if (!aseguradora)
                return DefaultResponse.sendNotFound(
                    this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                        lang: payload.lang,
                    }),
                );

            solicitud.aseguradora = aseguradora;
        }

        return DefaultResponse.sendOk('', solicitud);
    }

    async findOneByFolio(payload: { folio: string; lang: string }) {
        if (!Types.ObjectId.isValid(payload.folio))
            return DefaultResponse.sendBadRequest(
                this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
                    lang: payload.lang,
                }),
            );

        const solicitud = await this.solicitudService.findOneByFolio(payload.folio);

        if (!solicitud)
            return DefaultResponse.sendNotFound(
                this.i18n.translate('core.VALIDATIONS.NOT_FOUND', {
                    lang: payload.lang,
                }),
            );

        return DefaultResponse.sendOk('', solicitud);
    }


    async avanzar(
        payload: {
            workflow: WorkflowDto;
            bearer: string | undefined;
            session: SessionTokenDto;
            i18nContext: I18nContext;
        }

    ) {
        const { session, bearer, i18nContext, workflow } = payload;

        if (!TokenValidator.isValid(session) || !bearer)
            return DefaultResponse.sendUnauthorized(
                this.i18n.translate('server.JWTOKEN.ERROR', {
                    lang: i18nContext.lang
                }),
            );

        const workflowResult = await this.workflowService.avanzar({
            session,
            workflow: workflow,
            lang: i18nContext.lang,
        });

        if (!workflowResult.success) return DefaultResponse.sendBadRequest(
            workflowResult.message,
            workflowResult.data,
        );

        if (workflow.notificacion == ENotificacion.SOLICITUD) {
            this.notificacionService.solicitud(i18nContext, session, bearer, workflow);

            if (workflow.actividadInicial == EKycActividad.CONTACTO_ASEGURADORA && workflow.actividadFinal == EKycActividad.VALIDACION_DIGITAL) {
                this.notificacionService.recepcionDocumentos(i18nContext, session, bearer, workflow);
            }
        }

        if (workflow.notificacion == ENotificacion.REVISION_DOCUMENTAL) {
            this.notificacionService.revision(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.SOLICITUD_FIRMA_EJECUTIVO) {
            this.notificacionService.solicitudfirmaEjecutivo(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.RECOLECCION_FISICOS) {
            this.notificacionService.recoleccionFisicos(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.FORMATOS_FIRMADOS) {

            this.notificacionService.formatosFirmados(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.FISICOS_ENVIADOS) {
            this.notificacionService.fisicosEnviados(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.REVISION_DOCUMENTACION_FISICA) {
            this.notificacionService.revisionDocumentacionFisica(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.SOLICITUD_FIRMA_ASEGURADO) {
            this.notificacionService.solicitudFirmaAsegurado(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.REVISION_FORMATOS) {
            this.notificacionService.revisionFormatos(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.FIRMA_DOCUMENTOS) {
            this.notificacionService.firmaDocumentos(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.DATOS_CONTACTO) {
            this.notificacionService.datosContacto(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.NO_CONTINUA_PROCESO) {
            this.notificacionService.noContinuaProceso(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.GENERACION_DE_FORMATOS) {
            this.notificacionService.generacionDeFormatos(i18nContext, session, bearer, workflow);
        }

        if (workflow.notificacion == ENotificacion.CONFIRMACION_ENTREGA) {
            
            this.notificacionService.confirmacionEntrega(i18nContext, session, bearer, workflow);
        }

        return DefaultResponse.sendOk('', workflowResult);
    }


    async reenviarFormatosFirmados(
        payload: {
            workflow: IFnzWorklFlow,
            bearer: string | undefined,
            session: SessionTokenDto,
            i18nContext: I18nContext;
        }
    ) {
        const { session, bearer, i18nContext, workflow } = payload;
        if (workflow.notificacion == ENotificacion.FORMATOS_FIRMADOS) {
            this.notificacionService.formatosFirmados(i18nContext, session, bearer, workflow);
        }
        return DefaultResponse.sendOk('Correo reenviado satisfactoriamente.', null);
    }


    async noContinuaProceso(
        payload: {
            workflow: IFnzWorklFlow,
            bearer: string | undefined,
            session: SessionTokenDto,
            i18nContext: I18nContext
        }
    ) {
        const { session, bearer, i18nContext, workflow } = payload;
        if (!TokenValidator.isValid(session) || !bearer)
            return DefaultResponse.sendUnauthorized(
                this.i18n.translate('server.JWTOKEN', {
                    lang: i18nContext.lang,
                }),
            );

        if (workflow.notificacion == ENotificacion.NO_CONTINUA_PROCESO) {
            this.notificacionService.noContinuaProceso(i18nContext, session, bearer, workflow);
        }
        return DefaultResponse.sendOk('', null);
    }





}