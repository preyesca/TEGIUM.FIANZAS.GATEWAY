import {ReporteSeguimientoType} from '../helpers/interfaces/reporte-seguimiento.interface';
import {getFechaReportLocal} from '../../../../app/utils/moment/date.moment';
import {EKycActividad} from '../../../../app/common/enum/kyc/kyc.actividad.enum';
import {EEstatusActividad} from "../../../../app/common/enum/estatus-actividad.enum";
import {EComentario} from '../helpers/enum/core.comentario';

export class ReporteSeguimiento {
	constructor(private response: ReporteSeguimientoType) {
	}

	get actualActivity() {
		const allowedActivities = [
			EKycActividad.CONTACTO_ASEGURADORA,
			EKycActividad.CONTACTO_TELEFONICO,
		];

		return this.response.workflowActividades.find((activity) => {
			return !allowedActivities.includes(activity.actividad.clave);
		});
	}

	get nroReprocesos() {
		const actividadesUnicas = new Set<number>();
		this.response.workflowActividades.forEach(({actividad}) =>
			actividadesUnicas.add(actividad.clave),
		);
		const nroActividades = this.response.workflowActividades.length;
		const nroActividadesUnicas = actividadesUnicas.size;

		return nroActividades - nroActividadesUnicas;
	}

	get observaciones() {
		// todo:  se debe mostrar la ultima actividad o penultima actividad los comentarios 07/05/2024
		const actividades = this.response.comentarios.actividades;
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

		// const bitacora = this.response.bitacora.find(
		// 	(b) => b.actividad === this.actualActivity.actividad.clave,
		// );
		//
		// if (bitacora) {
		// 	return bitacora.estatusBitacora;
		// }

		return '';
	}

	buscarActividad(actividad: EKycActividad) {
		const findActivity = this.response.workflowActividades.find(
			(worflow) => worflow.actividad.clave === actividad,
		);
		if (findActivity) {
			return {
				...findActivity,
				fechaAlta: getFechaReportLocal(findActivity.fechaAlta), // fecha mexico
				fechaInicial: getFechaReportLocal(findActivity.fechaInicial),
				fechaFinal: getFechaReportLocal(findActivity.fechaFinal),
			};
		}
		return {
			fechaInicial: '',
			fechaAlta: '',
			fechaFinal: '',
		};
	}

	contactoTelefonico(index: number) {
		const nroContactos = this.response.contactoTelefonico.length;
		if (index < nroContactos) {
			const contactoTelefonico = this.response.contactoTelefonico[index];
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
		const tareaActividades = this.response.actividadReminder;
		if (index < tareaActividades.length) {
			return getFechaReportLocal(tareaActividades[index].fechaEnvio);
		}
		return '';
	}

	get ultimoComentarioFecha() {
		const actividades = this.response.comentarios.actividades;
		for (let i = actividades.length - 1; i >= 0; i--) {
			const activity = actividades[i];
			if (activity.actividad === this.actualActivity.actividad.clave) {
				return getFechaReportLocal(activity.fecha);
			}
		}
		return '';
	}

	get hasReproceso() {
		const statusActivity = this.actualActivity.estatusActividad.clave;
		return statusActivity === EEstatusActividad.EN_REPROCESO
			? 'En reproceso CG'
			: 'Sin reproceso CG';
	}

	get documentosFaltantes(): string {
		const CAT_CLIENTE = 1;
		const documentosRequeridos = this.response.documentosRequeridos.filter(
			(doc) => {
				if (doc.categoria === CAT_CLIENTE) {
					return doc;
				}
			},
		);
		let documentosSubidos: string[] = [];
		if (this.response.documentosCorrectos.length > 0) {
			documentosSubidos = this.response.documentosCorrectos[0].archivos
				.filter((v) => {
					if (v.correcto) {
						return v;
					}
				})
				.map((doc) => doc.documento.toString());
		}
		//
		const documentsFaltantes = documentosRequeridos.filter(
			(doc) => !documentosSubidos.includes(doc._id.toString()),
		);
		return documentsFaltantes.map((doc) => doc.nombre).join(' , ');
	}

	get statusActivity() {
		const idActivity = this.actualActivity.actividad.clave;
		const idEstatusActivity = this.actualActivity.estatusActividad.clave;
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

	getDataToExcel(): string[] {
		return [
			this.response.folioMultisistema.toString(), //Columna A;1
			this.response.titular.numeroCliente.toString(), //Columna B;2
			this.actualActivity.actividad.clave === EKycActividad.FIN
				? 'Finalizado'
				: this.actualActivity.actividad.descripcion, //Columna C;3
			this.response.usuario.nombreCompleto.trim(), //Columna D;4
			this.response.unidad.descripcion, //Columna E;5
			this.response.titular.nombre, //Columna F;6
			this.response.aseguradora.nombreComercial, //Columna G;7
			this.response.tipoMovimiento.descripcion, //Columna H;8
			this.hasReproceso, //Columna I;9
			getFechaReportLocal(this.response.fechaAlta), //Columna J;10
			this.buscarActividad(EKycActividad.CARGA_DOCUMENTAL).fechaAlta, //Columna K;11
			this.buscarActividad(EKycActividad.VALIDACION_DIGITAL).fechaFinal, //Columna L;12
			this.buscarActividad(EKycActividad.FIRMA_CLIENTE).fechaAlta, //Columna M;13
			this.buscarActividad(EKycActividad.VALIDACION_FIRMAS).fechaAlta, //Columna N;14
			this.buscarActividad(EKycActividad.VALIDACION_AFIANZADORA).fechaAlta, //Columna O;15
			this.buscarActividad(EKycActividad.RECOLECCION_FISICOS).fechaAlta, //Columna P;16
			this.buscarActividad(EKycActividad.CONFIRMACION_ENTREGA).fechaAlta, //Columna Q;17
			this.nroReprocesos + '', //Columna R;18
			this.statusActivity, //Columna S;19
			this.response.riesgo.descripcion, //Columna T;20
			this.observaciones, //Columna U;21
			this.response.informacionEjecutivo.nombre, //Columna V;22
			this.ultimoComentarioFecha, //Columna W;23
			getFechaReportLocal(this.response.fechaVigencia), //Columna X;24
			this.contactoTelefonico(0).fechaProximaLlamada, //Columna Y;25
			this.contactoTelefonico(0).observaciones, //Columna Z;26
			this.contactoTelefonico(1).fechaProximaLlamada, // columna AA;nro:27
			this.contactoTelefonico(1).observaciones, //  columna AB;nro:28
			this.contactoTelefonico(2).fechaProximaLlamada, //  columna AC;nro:29
			this.contactoTelefonico(2).observaciones, // columna AD;nro:30
			this.taskActividadByIndex(2), // columna AE;nro:31
			this.taskActividadByIndex(1), // columna AF;nro:32
			this.taskActividadByIndex(0), // columna AG;nro:33
			this.documentosFaltantes, // columna AH;nro:34
		];
	}
}
