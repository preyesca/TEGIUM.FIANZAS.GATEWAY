import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {SharedServicesModule} from 'src/app/services/services.module';
import {AdmAseguradoraService} from '../administracion/domain/services/adm.aseguradora.service';
import {
	AdmConfiguracionAseguradoraService
} from '../administracion/domain/services/adm.configuracion-aseguradora.service';
import {
	AdmConfiguracionDocumentalService
} from '../administracion/domain/services/adm.configuracion-documental.service';
import {AdmDocumentoService} from '../administracion/domain/services/adm.documento.service';
import {AdmProyectoConfiguracionService} from '../administracion/domain/services/adm.proyecto-configuracion.service';
import {AdmProyectoService} from '../administracion/domain/services/adm.proyecto.service';
import {AdmUsuarioService} from '../administracion/domain/services/adm.usuario.service';
import {
	AdmAseguradora,
	AdmAseguradoraSchema,
} from '../administracion/persistence/database/adm.aseguradora.schema';
import {
	AdmConfiguracionAseguradora,
	AdmConfiguracionAseguradoraSchema,
} from '../administracion/persistence/database/adm.configuracion-aseguradora.schema';
import {
	AdmConfiguracionDocumental,
	AdmConfiguracionDocumentalSchema,
} from '../administracion/persistence/database/adm.configuracion-documental.schema';
import {
	AdmDocumento,
	AdmDocumentoSchema,
} from '../administracion/persistence/database/adm.documento.schema';
import {
	AdmMenuPerfil,
	AdmMenuPerfilSchema,
} from '../administracion/persistence/database/adm.menu-perfil.schema';
import {
	AdmPermisoPerfil,
	AdmPermisoPerfilSchema,
} from '../administracion/persistence/database/adm.permiso-perfil.schema';
import {
	AdmProyectoConfiguracion,
	AdmProyectoConfiguracionSchema,
} from '../administracion/persistence/database/adm.proyecto-configuracion.schema';
import {
	AdmProyectoFolio,
	AdmProyectoFolioSchema,
} from '../administracion/persistence/database/adm.proyecto-folio.schema';
import {
	AdmProyecto,
	AdmProyectoSchema,
} from '../administracion/persistence/database/adm.proyecto.schema';
import {
	AdmUsuario,
	AdmUsuarioSchema,
} from '../administracion/persistence/database/adm.usuario.schema';
import {AdmAseguradoraRepository} from '../administracion/persistence/repository/adm.aseguradora.repository';
import {
	AdmConfiguracionAseguradoraRepository
} from '../administracion/persistence/repository/adm.configuracion-aseguradora.repository';
import {
	AdmConfiguracionDocumentalRepository
} from '../administracion/persistence/repository/adm.configuracion-documental.repository';
import {AdmDocumentoRepository} from '../administracion/persistence/repository/adm.documento.repository';
import {AdmMenuPerfilRepository} from '../administracion/persistence/repository/adm.menu-perfil.repository';
import {AdmPermisoPerfilRepository} from '../administracion/persistence/repository/adm.permiso-perfil.repository';
import {
	AdmProyectoConfiguracionRepository
} from '../administracion/persistence/repository/adm.proyecto-configuracion.repository';
import {AdmProyectoFolioRepository} from '../administracion/persistence/repository/adm.proyecto-folio.repository';
import {AdmProyectoRepository} from '../administracion/persistence/repository/adm.proyecto.repository';
import {AdmUsuarioRepository} from '../administracion/persistence/repository/adm.usuario.repository';
import {BitActividadService} from '../bitacora/domain/services/bit.actividad.service';
import {BitNotificacionService} from '../bitacora/domain/services/bit.notificacion.service';
import {
	BitActividad,
	BitActividadSchema,
} from '../bitacora/persistence/database/bit.actividad.schema';
import {
	BitNotificacion,
	BitNotificacionSchema,
} from '../bitacora/persistence/database/bit.notificacion.shema';
import {BitActividadRepository} from '../bitacora/persistence/repository/bit.actividad.repository';
import {BitNotificacionRepository} from '../bitacora/persistence/repository/bit.notificacion.repository';
import {CatSharedService} from '../catalogo/domain/services/_cat.shared.service';
import {CatGiroService} from '../catalogo/domain/services/cat.giro.service';
import {CatMotivoRechazoService} from '../catalogo/domain/services/cat.motivo-rechazo.service';
import {CatRiesgoService} from '../catalogo/domain/services/cat.riesgo.service';
import {CatTipoCargaService} from '../catalogo/domain/services/cat.tipo-carga.service';
import {CatTipoLlamadaService} from '../catalogo/domain/services/cat.tipo-llamada.service';
import {CatTipoMovimientoService} from '../catalogo/domain/services/cat.tipo-movimiento.service';
import {CatUnidadService} from '../catalogo/domain/services/cat.unidad.service';
import {
	CatActividad,
	CatActividadSchema,
} from '../catalogo/persistence/database/cat.actividad.schema';
import {
	CatCategoriaDocumento,
	CatCategoriaDocumentoSchema,
} from '../catalogo/persistence/database/cat.categoria-documento.schema';
import {
	CatEstatusActividad,
	CatEstatusActividadSchema,
} from '../catalogo/persistence/database/cat.estatus-actividad.schema';
import {
	CatEstatusContactoTelefonico,
	CatEstatusContactoTelefonicoSchema,
} from '../catalogo/persistence/database/cat.estatus-contacto-telefonico.schema';
import {
	CatEstatusGeneral,
	CatEstatusGeneralSchema,
} from '../catalogo/persistence/database/cat.estatus-general.schema';
import {
	CatEstatusUsuario,
	CatEstatusUsuarioSchema,
} from '../catalogo/persistence/database/cat.estatus-usuario.schema';
import {
	CatGiro,
	CatGiroSchema,
} from '../catalogo/persistence/database/cat.giro.schema';
import {
	CatMotivoRechazo,
	CatMotivoRechazoSchema,
} from '../catalogo/persistence/database/cat.motivo-rechazo.schema';
import {
	CatNegocio,
	CatNegocioSchema,
} from '../catalogo/persistence/database/cat.negocio.schema';
import {
	CatOficina,
	CatOficinaSchema,
} from '../catalogo/persistence/database/cat.oficina.schema';
import {
	CatPais,
	CatPaisSchema,
} from '../catalogo/persistence/database/cat.pais.schema';
import {
	CatPerfil,
	CatPerfilSchema,
} from '../catalogo/persistence/database/cat.perfil.schema';
import {
	CatProceso,
	CatProcesoSchema,
} from '../catalogo/persistence/database/cat.proceso.schema';
import {
	CatRamo,
	CatRamoSchema,
} from '../catalogo/persistence/database/cat.ramo.schema';
import {
	CatRiesgo,
	CatRiesgoSchema,
} from '../catalogo/persistence/database/cat.riesgo.schema';
import {
	CatTipoCarga,
	CatTipoCargaSchema,
} from '../catalogo/persistence/database/cat.tipo-carga.schema';
import {
	CatTipoContacto,
	CatTipoContactoSchema,
} from '../catalogo/persistence/database/cat.tipo-contacto.schema';
import {
	CatTipoLlamada,
	CatTipoLlamadaSchema,
} from '../catalogo/persistence/database/cat.tipo-llamada.schema';
import {
	CatTipoMovimiento,
	CatTipoMovimientoSchema,
} from '../catalogo/persistence/database/cat.tipo-movimiento.schema';
import {
	CatTipoPersona,
	CatTipoPersonaSchema,
} from '../catalogo/persistence/database/cat.tipo-persona.schema';
import {
	CatUnidad,
	CatUnidadSchema,
} from '../catalogo/persistence/database/cat.unidad.schema';
import {CatActividadRepository} from '../catalogo/persistence/repository/cat.actividad.repository';
import {CatCategoriaDocumentoRepository} from '../catalogo/persistence/repository/cat.categoria-documento.repository';
import {CatEstatusActividadRepository} from '../catalogo/persistence/repository/cat.estatus-actividad.repository';
import {
	CatEstatusContactoTelefonicoRepository
} from '../catalogo/persistence/repository/cat.estatus-contacto-telefonico.repository';
import {CatEstatusGeneralRepository} from '../catalogo/persistence/repository/cat.estatus-general.repository';
import {CatEstatusUsuarioRepository} from '../catalogo/persistence/repository/cat.estatus-usuario.repository';
import {CatGiroRepository} from '../catalogo/persistence/repository/cat.giro.repository';
import {CatMotivoRechazoRepository} from '../catalogo/persistence/repository/cat.motivo-rechazo.repository';
import {CatNegocioRepository} from '../catalogo/persistence/repository/cat.negocio.repository';
import {CatOficinaRepository} from '../catalogo/persistence/repository/cat.oficina.repository';
import {CatPaisRepository} from '../catalogo/persistence/repository/cat.pais.repository';
import {CatPerfilRepository} from '../catalogo/persistence/repository/cat.perfil.repository';
import {CatProcesoRepository} from '../catalogo/persistence/repository/cat.proceso.repository';
import {CatRamoRepository} from '../catalogo/persistence/repository/cat.ramo.repository';
import {CatRiesgoRepository} from '../catalogo/persistence/repository/cat.riesgo.repository';
import {CatTipoCargaRepository} from '../catalogo/persistence/repository/cat.tipo-carga.repository';
import {CatTipoContactoRepository} from '../catalogo/persistence/repository/cat.tipo-contacto.repository';
import {CatTipoLlamadaRepository} from '../catalogo/persistence/repository/cat.tipo-llamada.repository';
import {CatTipoMovimientoRepository} from '../catalogo/persistence/repository/cat.tipo-movimiento.repository';
import {CatTipoPersonaRepository} from '../catalogo/persistence/repository/cat.tipo-persona.repository';
import {CatUnidadRepository} from '../catalogo/persistence/repository/cat.unidad.repository';
import {ExpArchivoService} from '../expediente/domain/services/exp.archivo.service';
import {
	ExpArchivo,
	ExpArchivoSchema,
} from '../expediente/persistence/database/exp.archivo.schema';
import {ExpArchivoRepository} from '../expediente/persistence/repository/exp.archivo.repository';
import {WorkflowActividadService} from '../workflow/domain/services/workflow.actividad.service';
import {WorkflowService} from '../workflow/domain/services/workflow.service';
import {
	WorkflowActividad,
	WorkflowActividadSchema,
} from '../workflow/persistence/database/workflow.actividad.schema';
import {WorkflowActividadRepository} from '../workflow/persistence/repository/workflow.actividad.repository';
import {WorkflowConsultarRepository} from '../workflow/persistence/repository/workflow.consultar.repository';
import {WorkflowRepository} from '../workflow/persistence/repository/workflow.repository';
import {CoreBandejaService} from './domain/services/core.bandeja.service';
import {CoreComentarioService} from './domain/services/core.comentario.service';
import {CoreFolioLayoutService} from './domain/services/core.folio-layout.service';
import {CoreFolioService} from './domain/services/core.folio.service';
import {CoreInformacionContactoService} from './domain/services/core.informacion-contacto.service';
import {CoreNotificacionService} from './domain/services/core.notificacion.service';
import {CorePortalAseguradoService} from './domain/services/core.portal.service';
import {CoreTitularService} from './domain/services/core.titular.service';
import {FlowConfirmacionEntregaService} from './domain/services/flows/flow.confirmacion-entrega.service';
import {FlowContactoTelefonicoService} from './domain/services/flows/flow.contacto-telefonico.service';
import {FlowFirmaEjecutivoService} from './domain/services/flows/flow.firma-ejecutivo.service';
import {FlowFirmaClienteService} from './domain/services/flows/flow.firma-cliente.service';
import {FlowListaNegraService} from './domain/services/flows/flow.lista-negra.service';
import {FlowSolicitudService} from './domain/services/flows/flow.solicitud.service';
import {FlowValidacionDigitalService} from './domain/services/flows/flow.validacion-digital.service';
import {FlowValidacionFirmaService} from './domain/services/flows/flow.validacion-firma.service';
import {FlowValidacionOriginalService} from './domain/services/flows/flow.validacion-original.service';
import {
	CoreComentario,
	CoreComentarioSchema,
} from './persistence/database/core.comentario.schema';
import {
	CoreFolioLayoutDetail,
	CoreFolioLayoutDetailSchema,
} from './persistence/database/core.folio-layout-detail.schema';
import {
	CoreFolioLayout,
	CoreFolioLayoutSchema,
} from './persistence/database/core.folio-layout.schema';
import {
	CoreFolio,
	CoreFolioSchema,
} from './persistence/database/core.folio.schema';
import {
	CoreInformacionContacto,
	CoreInformacionContactoSchema,
} from './persistence/database/core.informacion-contacto.schema';
import {
	CoreInformacionEjecutivo,
	CoreInformacionEjecutivoSchema,
} from './persistence/database/core.informacion-ejecutivo.schema';
import {
	CorePoliza,
	CorePolizaSchema,
} from './persistence/database/core.poliza.schema';
import {
	CoreTelefonoContacto,
	CoreTelefonoContactoSchema,
} from './persistence/database/core.telefono-contacto.schema';
import {
	CoreTitular,
	CoreTitularSchema,
} from './persistence/database/core.titular.schema';
import {
	FlowContactoTelefonico,
	FlowContactoTelefonicoSchema,
} from './persistence/database/flows/flow-contacto-telefonico.schema';
import {
	FlowListaNegra,
	FlowListaNegraSchema,
} from './persistence/database/flows/flow-lista-negra.schema';
import {
	FlowConfirmacionEntrega,
	FlowConfirmacionEntregaSchema,
} from './persistence/database/flows/flow.confirmacion-entrega.schema';
import {
	FlowFirmaCliente,
	FlowFirmaClienteSchema,
} from './persistence/database/flows/flow.firma-cliente.schema';
import {
	FlowFirmaEjecutivo,
	FlowFirmaEjecutivoSchema,
} from './persistence/database/flows/flow.firma-ejecutivo.schema';
import {
	FlowRecoleccionFisicos,
	FlowRecoleccionFisicosSchema,
} from './persistence/database/flows/flow.recoleccion-fisicos.schema';
import {
	FlowSolicitud,
	FlowSolicitudSchema,
} from './persistence/database/flows/flow.solicitud.schema';
import {
	FlowValidacionDigital,
	FlowValidacionDigitalSchema,
} from './persistence/database/flows/flow.validacion-digital.schema';
import {
	FlowValidacionFirma,
	FlowValidacionFirmaSchema,
} from './persistence/database/flows/flow.validacion-firma.schema';
import {
	FlowValidacionOriginal,
	FlowValidacionOriginalSchema,
} from './persistence/database/flows/flow.validacion-original.schema';
import {CoreComentarioRepository} from './persistence/repository/core.comentario.repository';
import {CoreFolioLayoutRepository} from './persistence/repository/core.folio-layout.repository';
import {CoreFolioRepository} from './persistence/repository/core.folio.repository';
import {CoreInformacionContactoRepository} from './persistence/repository/core.informacion-contacto.repository';
import {CoreInformacionEjecutivoRepository} from './persistence/repository/core.informacion-ejecutivo.repository';
import {CorePolizaRepository} from './persistence/repository/core.poliza.repository';
import {CoreTelefonoContactoRepository} from './persistence/repository/core.telefono-contacto.repository';
import {CoreTitularRepository} from './persistence/repository/core.titular.repository';
import {FlowConfirmacionEntregaRepository} from './persistence/repository/flows/flow.confirmacion-entrega.repository';
import {FlowContactoTelefonicoRepository} from './persistence/repository/flows/flow.contacto-telefonico.repository';
import {FlowFirmaClienteRepository} from './persistence/repository/flows/flow.firma-cliente.repository';
import {FlowFirmaEjecutivoRepository} from './persistence/repository/flows/flow.firma-ejecutivo.repository';
import {FlowListaNegraRepository} from './persistence/repository/flows/flow.lista-negra.repository';
import {FlowRecoleccionFisicosRepository} from './persistence/repository/flows/flow.recoleccion-fisicos.repository';
import {FlowSolicitudRepository} from './persistence/repository/flows/flow.solicitud.repository.';
import {FlowValidacionDigitalRepository} from './persistence/repository/flows/flow.validacion-digital.repository';
import {FlowValidacionFirmaRepository} from './persistence/repository/flows/flow.validacion-firma.repository';
import {FlowValidacionOriginalRepository} from './persistence/repository/flows/flow.validacion-original.repository';
import {
	FlowValidacionAfianzadora,
	FlowValidacionAfianzadoraSchema
} from './persistence/database/flows/flow.validacion-afianzadora.schema';
import {
	FlowValidacionAfianzadoraRepository
} from './persistence/repository/flows/flow.validacion-afianzadora.repository';
import {FlowValidacionAfianzadoraService} from './domain/services/flows/flow.validacion-afianzadora.service';
import {FlowRecoleccionFisicosServices} from "./domain/services/flows/flow.recoleccion-fisicos.service";
import {
	AuthSesionUsuario,
	AuthSesionUsuarioSchema
} from '../autenticacion/persistence/database/auth.sesion-usuario.schema';
import {AuthSesionUsuarioRepository} from '../autenticacion/persistence/repository/auth.sesion-usuario.repository';
import {NotificationModule} from 'src/notifications/notification.module';
import {CoreReporteService} from "./domain/services/core.reporte.service";
import {CoreReportRepository} from "./persistence/repository/core.report.repository";
import {
	TaskReportNotificationRepository
} from "../../schedules/persistence/repository/task.report-notification.repository";
import {
	TaskReportNotification,
	TaskReportNotificationSchema
} from "../../schedules/persistence/database/task.report-notification.schema";
import {CoreFolioReportService} from "./domain/services/core.folio-report.service";
import {CoreFolioReportRepository} from "./persistence/repository/core.folio-report.repository";

const models = {
	administracion: [
		{name: AdmAseguradora.name, useFactory: () => AdmAseguradoraSchema},
		{
			name: AdmConfiguracionAseguradora.name,
			useFactory: () => AdmConfiguracionAseguradoraSchema,
		},
		{
			name: AdmConfiguracionDocumental.name,
			useFactory: () => AdmConfiguracionDocumentalSchema,
		},
		{name: AdmDocumento.name, useFactory: () => AdmDocumentoSchema},
		{name: AdmMenuPerfil.name, useFactory: () => AdmMenuPerfilSchema},
		{name: AdmPermisoPerfil.name, useFactory: () => AdmPermisoPerfilSchema},
		{name: AdmProyecto.name, useFactory: () => AdmProyectoSchema},
		{
			name: AdmProyectoConfiguracion.name,
			useFactory: () => AdmProyectoConfiguracionSchema,
		},
		{name: AdmProyectoFolio.name, useFactory: () => AdmProyectoFolioSchema},
		{name: AdmUsuario.name, useFactory: () => AdmUsuarioSchema},
	],
	bitacora: [
		{name: BitActividad.name, useFactory: () => BitActividadSchema},
		{name: BitNotificacion.name, useFactory: () => BitNotificacionSchema},
	],
	catalogos: [
		{name: CatActividad.name, useFactory: () => CatActividadSchema},
		{
			name: CatCategoriaDocumento.name,
			useFactory: () => CatCategoriaDocumentoSchema,
		},
		{
			name: CatEstatusActividad.name,
			useFactory: () => CatEstatusActividadSchema,
		},
		{
			name: CatEstatusContactoTelefonico.name,
			useFactory: () => CatEstatusContactoTelefonicoSchema,
		},
		{name: CatEstatusGeneral.name, useFactory: () => CatEstatusGeneralSchema},
		{name: CatEstatusUsuario.name, useFactory: () => CatEstatusUsuarioSchema},
		{name: CatGiro.name, useFactory: () => CatGiroSchema},
		{name: CatMotivoRechazo.name, useFactory: () => CatMotivoRechazoSchema},
		{name: CatNegocio.name, useFactory: () => CatNegocioSchema},
		{name: CatOficina.name, useFactory: () => CatOficinaSchema},
		{name: CatPais.name, useFactory: () => CatPaisSchema},
		{name: CatPerfil.name, useFactory: () => CatPerfilSchema},
		{name: CatProceso.name, useFactory: () => CatProcesoSchema},
		{name: CatRamo.name, useFactory: () => CatRamoSchema},
		{name: CatRiesgo.name, useFactory: () => CatRiesgoSchema},
		{name: CatTipoCarga.name, useFactory: () => CatTipoCargaSchema},
		{name: CatTipoContacto.name, useFactory: () => CatTipoContactoSchema},
		{name: CatTipoLlamada.name, useFactory: () => CatTipoLlamadaSchema},
		{name: CatTipoMovimiento.name, useFactory: () => CatTipoMovimientoSchema},
		{name: CatTipoPersona.name, useFactory: () => CatTipoPersonaSchema},
		{name: CatUnidad.name, useFactory: () => CatUnidadSchema},
	],
	core: [
		{name: CoreComentario.name, useFactory: () => CoreComentarioSchema},
		{name: CoreFolio.name, useFactory: () => CoreFolioSchema},
		{name: CoreFolioLayout.name, useFactory: () => CoreFolioLayoutSchema},
		{
			name: CoreFolioLayoutDetail.name,
			useFactory: () => CoreFolioLayoutDetailSchema,
		},
		{
			name: CoreInformacionContacto.name,
			useFactory: () => CoreInformacionContactoSchema,
		},
		{
			name: CoreInformacionEjecutivo.name,
			useFactory: () => CoreInformacionEjecutivoSchema,
		},
		{name: CorePoliza.name, useFactory: () => CorePolizaSchema},
		{name: CoreTitular.name, useFactory: () => CoreTitularSchema},
		{
			name: FlowConfirmacionEntrega.name,
			useFactory: () => FlowConfirmacionEntregaSchema,
		},
		{
			name: FlowRecoleccionFisicos.name,
			useFactory: () => FlowRecoleccionFisicosSchema,
		},
		{
			name: FlowContactoTelefonico.name,
			useFactory: () => FlowContactoTelefonicoSchema,
		},
		{
			name: FlowFirmaCliente.name,
			useFactory: () => FlowFirmaClienteSchema,
		},
		{
			name: FlowFirmaEjecutivo.name,
			useFactory: () => FlowFirmaEjecutivoSchema,
		},
		{
			name: FlowListaNegra.name,
			useFactory: () => FlowListaNegraSchema,
		},
		{
			name: FlowValidacionDigital.name,
			useFactory: () => FlowValidacionDigitalSchema,
		},
		{
			name: FlowValidacionFirma.name,
			useFactory: () => FlowValidacionFirmaSchema,
		},
		{
			name: CoreTelefonoContacto.name,
			useFactory: () => CoreTelefonoContactoSchema,
		},
		{
			name: FlowValidacionOriginal.name,
			useFactory: () => FlowValidacionOriginalSchema,
		},
		{
			name: FlowSolicitud.name,
			useFactory: () => FlowSolicitudSchema,
		},
		{
			name: FlowValidacionAfianzadora.name,
			useFactory: () => FlowValidacionAfianzadoraSchema,
		}

	],
	expediente: [{name: ExpArchivo.name, useFactory: () => ExpArchivoSchema}],
	workflow: [
		{name: WorkflowActividad.name, useFactory: () => WorkflowActividadSchema},
	],
	auth: [
		{name: AuthSesionUsuario.name, useFactory: () => AuthSesionUsuarioSchema},
	],
	tasks: [
		{
			name: TaskReportNotification.name,
			useFactory: () => TaskReportNotificationSchema,
		},
	],
};

const Repositories = [
	AdmDocumentoRepository,
	AdmAseguradoraRepository,
	AdmConfiguracionAseguradoraRepository,
	AdmConfiguracionDocumentalRepository,
	AdmMenuPerfilRepository,
	AdmPermisoPerfilRepository,
	AdmProyectoRepository,
	AdmProyectoConfiguracionRepository,
	AdmProyectoFolioRepository,
	AdmUsuarioRepository,
	BitActividadRepository,
	BitNotificacionRepository,
	CatActividadRepository,
	CatCategoriaDocumentoRepository,
	CatEstatusActividadRepository,
	CatEstatusContactoTelefonicoRepository,
	CatEstatusGeneralRepository,
	CatEstatusUsuarioRepository,
	CatGiroRepository,
	CatMotivoRechazoRepository,
	CatNegocioRepository,
	CatOficinaRepository,
	CatPaisRepository,
	CatPerfilRepository,
	CatProcesoRepository,
	CatRamoRepository,
	CatRiesgoRepository,
	CatTipoCargaRepository,
	CatTipoContactoRepository,
	CatTipoLlamadaRepository,
	CatTipoMovimientoRepository,
	CatTipoPersonaRepository,
	CatUnidadRepository,
	CoreFolioRepository,
	CoreInformacionContactoRepository,
	CoreTitularRepository,
	CoreFolioLayoutRepository,
	CoreFolioRepository,
	CoreInformacionEjecutivoRepository,
	CorePolizaRepository,
	CoreComentarioRepository,
	CorePolizaRepository,
	CoreFolioLayoutRepository,
	CoreReportRepository,
	CoreFolioReportRepository,
	TaskReportNotificationRepository,
	WorkflowActividadRepository,
	WorkflowConsultarRepository,
	WorkflowRepository,
	ExpArchivoRepository,
	FlowConfirmacionEntregaRepository,
	FlowContactoTelefonicoRepository,
	FlowFirmaClienteRepository,
	FlowFirmaEjecutivoRepository,
	FlowListaNegraRepository,
	FlowValidacionDigitalRepository,
	FlowValidacionFirmaRepository,
	CoreTelefonoContactoRepository,
	FlowValidacionOriginalRepository,
	FlowSolicitudRepository,
	FlowRecoleccionFisicosRepository,
	FlowValidacionAfianzadoraRepository,
	AuthSesionUsuarioRepository
];

const CoreServices = [
	CoreBandejaService,
	CoreComentarioService,
	CoreFolioLayoutService,
	CoreInformacionContactoService,
	WorkflowActividadService,
	WorkflowService,
	CoreFolioService,
	CoreFolioReportService,
	CoreNotificacionService,
	CorePortalAseguradoService,
	CoreTitularService,
	CoreReporteService,
	FlowSolicitudService,
	FlowConfirmacionEntregaService,
	FlowContactoTelefonicoService,
	FlowFirmaEjecutivoService,
	FlowFirmaClienteService,
	FlowListaNegraService,
	FlowRecoleccionFisicosServices,
	FlowValidacionDigitalService,
	FlowValidacionFirmaService,
	FlowValidacionOriginalService,
	FlowValidacionAfianzadoraService,
];

const Services = [
	...CoreServices,
	AdmAseguradoraService,
	AdmConfiguracionDocumentalService,
	AdmConfiguracionAseguradoraService,
	AdmDocumentoService,
	AdmProyectoService,
	AdmProyectoConfiguracionService,
	AdmUsuarioService,
	BitActividadService,
	BitNotificacionService,
	CatGiroService,
	CatMotivoRechazoService,
	CatRiesgoService,
	CatSharedService,
	CatTipoCargaService,
	CatTipoMovimientoService,
	CatTipoLlamadaService,
	CatUnidadService,
	ExpArchivoService,
	WorkflowService,
	WorkflowActividadService,
];

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			...models.administracion,
			...models.bitacora,
			...models.catalogos,
			...models.core,
			...models.expediente,
			...models.tasks,
			...models.workflow,
			...models.auth
		]),

		SharedServicesModule,
		NotificationModule
	],
	providers: [...Repositories, ...Services],
	exports: [...CoreServices],
})
export class CoreModule {
}
