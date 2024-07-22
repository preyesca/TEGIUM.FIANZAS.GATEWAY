import {Archivo, FolioReportType} from '../helpers/interfaces/folio-report-type.interface';
import {EKycActividad} from '../../../../app/common/enum/kyc/kyc.actividad.enum';
import {getFechaReportLocal} from '../../../../app/utils/moment/date.moment';
import {EComentario} from '../helpers/enum/core.comentario';
import {EEstatusActividad} from "../../../../app/common/enum/estatus-actividad.enum";

export class ReporteModel {
	constructor(private response: FolioReportType) {
	}

	get actualActivity() {
		const allowedActivities = [
			EKycActividad.CONTACTO_ASEGURADORA,
			EKycActividad.CONTACTO_TELEFONICO,
		];
		for (let i = this.response.workflow.length - 1; i >= 0; i--) {
			const activity = this.response.workflow[i];
			if (!allowedActivities.includes(activity.actividad.clave)) {
				return activity;
			}
		}
	}

	get hasReproceso() {
		return this.nroReprocesos > 0 ? 'En reproceso CG' : 'Sin reproceso CG';
	}

	get usuario() {
		const usuarioDetail = this.response.usuario;
		return {
			...this.response.usuario,
			nombreCompleto: `${usuarioDetail.nombre ?? ''} ${
				usuarioDetail.primerApellido ?? ''
			} ${usuarioDetail.segundoApellido ?? ''}`,
		};
	}

	buscarActividad(actividad: EKycActividad) {
		let findWorkflow;
		for (let i = this.response.workflow.length - 1; i >= 0; i--) {
			const workflow = this.response.workflow[i];
			if (workflow.actividad.clave === actividad) {
				findWorkflow = workflow;
				break;
			}
		}
		if (findWorkflow) {
			return {
				...findWorkflow,
				fechaAlta: getFechaReportLocal(findWorkflow.fechaAlta), // fecha mexico
				fechaInicial: getFechaReportLocal(findWorkflow.fechaInicial),
				fechaFinal: getFechaReportLocal(findWorkflow.fechaFinal),
			};
		}
		return {
			fechaInicial: '',
			fechaAlta: '',
			fechaFinal: '',
		};
	}

	get nroReprocesos(): number {
		const workFlowUnico = new Set<number>();
		this.response.workflow.forEach((workflow) =>
			workFlowUnico.add(workflow.actividad.clave),
		);
		const nroActividades = this.response.workflow.length;
		const nroActividadesUnicas = workFlowUnico.size;

		return nroActividades - nroActividadesUnicas;
	}

	get statusActivity() {
		const idActivity = this.actualActivity.actividad.clave;
		const idEstatusActivity = this.actualActivity.estatus.clave;
		let estado = 'Cerrado';
		const ACTIVITY_PENDING = [
			EKycActividad.NUEVO_FOLIO,
			EKycActividad.SOLICITUD,
			EKycActividad.CARGA_DOCUMENTAL,
			EKycActividad.CONTACTO_TELEFONICO,
		];
		const ACTIVITY_PROCESSED = [
			EKycActividad.VALIDACION_DIGITAL,
			EKycActividad.FIRMA_CLIENTE,
			EKycActividad.FIRMA_EJECUTIVO,
			EKycActividad.VALIDACION_FIRMAS,
		];

		const STATUS_CANCEL_FINISH = [
			EEstatusActividad.CANCELADA,
			EEstatusActividad.FINALIZADA,
		];
		if (
			ACTIVITY_PENDING.includes(idActivity) &&
			!STATUS_CANCEL_FINISH.includes(idEstatusActivity)
		) {
			estado = 'Pendiente';
		} else if (
			ACTIVITY_PROCESSED.includes(idActivity) &&
			!STATUS_CANCEL_FINISH.includes(idEstatusActivity)
		) {
			estado = 'Procesado';
		} else if (idEstatusActivity === EEstatusActividad.CANCELADA) {
			estado = 'Cancelado';
		}
		return estado;
	}

	get observaciones() {
		const actividades = this.response.comentario.actividades;
		for (let i = actividades.length - 1; i >= 0; i--) {
			const activity: any = actividades[i];
			if (
				![
					EComentario.SIN_COMENTARIOS,
					EComentario.BITACORA_TRANSICION,
				].includes(activity.comentarios)
			) {
				return activity.comentarios;
			}
		}
		// todo: por definir en un futuro reporte
		// const bitacora = this.response.bitacora.find(
		//   (b) => b.actividad === this.actualActivity.actividad.clave,
		// );
		//
		// if (bitacora) {
		//   return bitacora.estatusBitacora;
		// }

		return '';
	}

	get ultimoComentarioFecha() {
		const actividades = this.response.comentario.actividades;
		for (let i = actividades.length - 1; i >= 0; i--) {
			const activity = actividades[i];
			if (activity.actividad.clave === this.actualActivity.actividad.clave) {
				return getFechaReportLocal(activity.fecha);
			}
		}
		return '';
	}

	contactoTelefonico(index: number) {
		const contactoTelefonicos = this.response.flowContactoTelefonico.filter(
			(contacto) => contacto.tipoLlamada.clave === 2,
		);
		const nroContactos = contactoTelefonicos.length;
		if (index < nroContactos) {
			const contactoTelefonico = contactoTelefonicos[index];
			return {
				...contactoTelefonico,
				fechaProximaLlamada: getFechaReportLocal(
					contactoTelefonico.fechaProximaLlamada,
				),
			};
		}
		return {
			observaciones: '',
			tipoLlamada: -1,
			fechaProximaLlamada: '',
		};
	}

	taskActividadByIndex(index: number) {
		const tareaActividades =
			this.response.taskActividadReminder.reverse() || [];
		if (index < tareaActividades.length) {
			return getFechaReportLocal(tareaActividades[index].fechaEnvio);
		}
		return '';
	}

	get documentosFaltantes(): string {
		if (!this.response.configuracionDocumental) {
			return '';
		}
		const CAT_CLIENTE = 1;
		const {documento} = this.response.configuracionDocumental
		const documentosRequeridos = documento.filter((doc) => {
			if (doc.documento.categoria === CAT_CLIENTE && doc.activo) {
				return doc;
			}
		}).map(doc => doc.documento);

		let archivos: Archivo[] = []
		if (this.response.flowValidacionDocumental) {
			archivos = this.response.flowValidacionDocumental.archivos
		}

		let archivosCorrectos: string[] = [];
		if (archivos.length > 0) {
			archivosCorrectos = archivos
				.filter((v) => {
					if (v.correcto) {
						return v;
					}
				})
				.map((doc) => doc.documento.toString());
		}
		//
		const documentsFaltantes = documentosRequeridos.filter(
			(doc) => !archivosCorrectos.includes(doc._id.toString()),
		);
		return documentsFaltantes.map((doc) => doc.nombre).join(' , ');
	}

	get descriptionActualActivity() {
		return this.actualActivity.actividad.clave === EKycActividad.FIN
			? 'Finalizado'
			: this.actualActivity.actividad.descripcion
	}

	getDataToExcel(): string[] {
		return [
			this.response.folioMultisistema.toString(), // 1
			this.response.titular.numeroCliente.toString(), //2
			this.descriptionActualActivity,// columna C,nro:3
			this.usuario.nombreCompleto.trim(), //4
			this.response.poliza.unidad.descripcion, //5
			this.response.titular.nombre, // 6
			this.response.poliza.aseguradora.nombreComercial, // 7
			this.response.tipoMovimiento.descripcion, //8
			this.hasReproceso,// 9
			getFechaReportLocal(this.response.fechaAlta), // 10
			this.buscarActividad(EKycActividad.CARGA_DOCUMENTAL).fechaAlta, //Columna K;11
			this.buscarActividad(EKycActividad.VALIDACION_DIGITAL).fechaAlta, //Columna L;12
			this.buscarActividad(EKycActividad.FIRMA_CLIENTE).fechaAlta, //Columna M;13
			this.buscarActividad(EKycActividad.VALIDACION_FIRMAS).fechaAlta, //Columna N;14
			this.buscarActividad(EKycActividad.VALIDACION_AFIANZADORA).fechaAlta, //Columna O;15
			this.buscarActividad(EKycActividad.RECOLECCION_FISICOS).fechaAlta, //Columna P;16
			this.buscarActividad(EKycActividad.CONFIRMACION_ENTREGA).fechaAlta, //Columna Q;17
			this.nroReprocesos + '', // 18
			this.statusActivity, // 19
			this.response.poliza.riesgo.descripcion, // 20
			this.observaciones, // 21
			this.response.ejecutivo.nombre, // 22
			this.ultimoComentarioFecha, // 23
			getFechaReportLocal(this.response.poliza.fechaVigencia), // 24
			this.contactoTelefonico(0).fechaProximaLlamada, // 25
			this.contactoTelefonico(0).observaciones, // 26
			this.contactoTelefonico(1).fechaProximaLlamada, // 27
			this.contactoTelefonico(1).observaciones, // 28
			this.contactoTelefonico(2).fechaProximaLlamada, // 29
			this.contactoTelefonico(2).observaciones, // 30
			this.taskActividadByIndex(2), // 31
			this.taskActividadByIndex(1), // 32
			this.taskActividadByIndex(0), // 33
			this.documentosFaltantes, // 34
		];
	}
}
