import {Controller, Logger} from '@nestjs/common';
import {
	ComentarioType,
	ConfiguracionDocumentalType,
	ContactoTelefonicoType,
	FolioReportType,
	TaskActividadReminderType,
	WorkflowType,
} from '../helpers/interfaces/folio-report-type.interface';
import {CoreFolioReportRepository} from '../../persistence/repository/core.folio-report.repository';
import * as moment from 'moment-timezone';
import {ConfigService} from '@nestjs/config';
import {ReporteModel} from "../model/reporte.model";

@Controller()
export class CoreFolioReportService {
	private readonly _logger = new Logger(CoreFolioReportService.name);

	constructor(
		private readonly coreFolioReportRepository: CoreFolioReportRepository,
		private readonly configService: ConfigService,
	) {
	}

	async getReportSeguimiento(fechaStart: string, fechaFin: string) {
		const timezone = this.configService.get<string>('MSH_TIME_ZONE');
		const fechaInicial = moment
			.tz(fechaStart.substring(0, 10), timezone)
			.startOf('day');

		const fechaFinal = moment
			.tz(fechaFin.substring(0, 10), timezone)
			.endOf('day');

		const folios = await this.coreFolioReportRepository.findByDate(
			fechaInicial,
			fechaFinal,
		);
		return folios.map((v) => {
			const report = new ReporteModel(v);
			return report.getDataToExcel();
		});
	}

	async createFolioReport(bodyFolio: FolioReportType) {
		const folio = {
			...bodyFolio,
			usuario: {
				_id: bodyFolio.usuario._id,
				nombre: bodyFolio.usuario.nombre,
				primerApellido: bodyFolio.usuario.primerApellido,
				segundoApellido: bodyFolio.usuario.segundoApellido,
				correoElectronico: bodyFolio.usuario.correoElectronico,
				proyectos: bodyFolio.usuario.proyectos,
			},
		};
		const workflow: WorkflowType[] =
			await this.coreFolioReportRepository.getWorkflowByFolio(
				folio.folioMultisistema,
			);
		const expediente =
			await this.coreFolioReportRepository.getArchivosByAseguradoraAndTitular(
				folio.poliza.aseguradora._id,
				folio.titular._id,
			);
		const comentarios: ComentarioType[] =
			await this.coreFolioReportRepository.getComentarioByBitacoraDetail(
				folio._id,
			);

		const configurationDocumental: ConfiguracionDocumentalType[] =
			await this.coreFolioReportRepository.getConfiguracionDocumentalDetail(
				folio.proyecto._id,
				folio.poliza.aseguradora._id,
				folio.titular.tipoPersona,
			);
		const flowContactoTelefonico: ContactoTelefonicoType[] =
			await this.coreFolioReportRepository.getFlowContactoTelefonico(folio._id);

		const taskReminder: TaskActividadReminderType[] =
			await this.coreFolioReportRepository.getTaskRemiderByFolio(folio._id);

		const flowValidacionDocumental = await this.coreFolioReportRepository.getFlowValidationDocumentaByFolio(folio._id)
		folio.configuracionDocumental = configurationDocumental[0];
		folio.workflow = workflow;
		folio.expediente = expediente;
		folio.comentario = comentarios[0];
		folio.flowContactoTelefonico = flowContactoTelefonico;
		folio.taskActividadReminder = taskReminder;
		folio.flowValidacionDocumental = flowValidacionDocumental
		try {
			await this.coreFolioReportRepository.create(folio);
		} catch (e) {
			console.log(e);
		}
	}

	async updateComentario(idFolio: string) {
		const comentarios: ComentarioType[] =
			await this.coreFolioReportRepository.getComentarioByBitacoraDetail(
				idFolio,
			);
		await this.coreFolioReportRepository.updateFieldById(
			idFolio,
			'comentario',
			comentarios[0],
		);
	}

	async updateWorkflow(idFolio: string) {
		try {
			const folioDetail = await this.coreFolioReportRepository.findOne(idFolio);
			if (folioDetail) {
				const workflow: WorkflowType[] =
					await this.coreFolioReportRepository.getWorkflowByFolio(
						folioDetail.folioMultisistema,
					);
				await this.coreFolioReportRepository.updateFieldById(
					idFolio,
					'workflow',
					workflow,
				);
			}
		} catch (e) {
			console.log(e);
		}
	}

	async updateFlowValidacionDocumental(idFolio: string) {
		try {
			const flowValidacionDocumental =
				await this.coreFolioReportRepository.getFlowValidationDocumentaByFolio(
					idFolio,
				);
			await this.coreFolioReportRepository.updateFieldById(
				idFolio,
				'flowValidacionDocumental',
				flowValidacionDocumental,
			);
		} catch (e) {
		}
	}

	async updateContactoTelefonico(idFolio: string) {
		try {
			const flowContactoTelefonico =
				await this.coreFolioReportRepository.getFlowContactoTelefonico(idFolio);
			await this.coreFolioReportRepository.updateFieldById(
				idFolio,
				'flowContactoTelefonico',
				flowContactoTelefonico,
			);
		} catch (e) {
			console.log(e);
		}
	}

	async updateTaskRemiderByfolio(idFolio: string) {
		try {
			const flowContactoTelefonico =
				await this.coreFolioReportRepository.getFlowContactoTelefonico(idFolio);
			await this.coreFolioReportRepository.updateFieldById(
				idFolio,
				'taskActividadReminder',
				flowContactoTelefonico,
			);
		} catch (e) {
			console.log(e);
		}
	}

	async migrarFolio() {
		await this.coreFolioReportRepository.cleanData()
		const folios: FolioReportType[] =
			await this.coreFolioReportRepository.migration();
		for (let i = 0; i < folios.length; i++) {
			const folio = folios[i];
			await this.createFolioReport(folio);
		}
	}
}
