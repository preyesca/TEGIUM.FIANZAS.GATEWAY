import {Injectable, Logger} from '@nestjs/common';
import {Cron, CronExpression} from '@nestjs/schedule';
import {I18nContext} from 'nestjs-i18n';
import {AppConsts} from 'src/app/AppConsts';
import {EEstatusActividad} from 'src/app/common/enum/estatus-actividad.enum';
import {EKycActividad} from 'src/app/common/enum/kyc/kyc.actividad.enum';
import {CoreNotificacionService} from 'src/modules/core/domain/services/core.notificacion.service';
import {CoreFolioRepository} from 'src/modules/core/persistence/repository/core.folio.repository';
import {WorkflowActividadRepository} from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import {TaskNotificacionReminderDto} from 'src/notifications/domain/helpers/dto/core/task-actividad-reminder.dto';
import {FnzWorkflowDto} from 'src/notifications/domain/helpers/dto/task/task.actividad-reminder.dto';
import {TaskActividadReminderRepository} from 'src/schedules/persistence/repository/task.actividad-reminder.repository';
import {TaskReportNotificationRepository} from "../../persistence/repository/task.report-notification.repository";
import {CoreReporteRequestDto} from "../../../endpoints/core/helpers/dtos/core.reporte.request.dto";
import {CoreReporteService} from "../../../modules/core/domain/services/core.reporte.service";
import {CatDiaFestivoRepository} from 'src/modules/catalogo/persistence/repository/cat.dia-festivo.repository';
import {DateTime} from 'luxon';
import {CoreFolioReportService} from "../../../modules/core/domain/services/core.folio-report.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class TaskService {
	private readonly _logger = new Logger(TaskService.name);

	constructor(
		private readonly taskActividadRemindeRepository: TaskActividadReminderRepository,
		private readonly flowWorkflowRepository: WorkflowActividadRepository,
		private readonly coreFolioRepository: CoreFolioRepository,
		private readonly taskReportNotificationRepository: TaskReportNotificationRepository,
		private readonly coreNotificacionService: CoreNotificacionService,
		private readonly coreReporteService: CoreReporteService,
		private readonly catDiaFestivoRepository: CatDiaFestivoRepository,
		private readonly coreFolioReportService: CoreFolioReportService,
		private readonly configService: ConfigService,
	) {
	}

	@Cron(CronExpression.EVERY_5_MINUTES)
	async sendActividadReminder(): Promise<void> {

		this._logger.verbose('START::: TaskService (sendActividadReminder)');

		if (await this.isWorkingTime()) {
			let workflow: FnzWorkflowDto = {folio: '', actividadInicial: EKycActividad.SOLICITUD};
			const i18n: I18nContext = <I18nContext>{lang: AppConsts.APP.Language};
			const dataResponse = await this.flowWorkflowRepository.findActividadesNotificacion();
			const taskReminder: TaskNotificacionReminderDto = {};

			for (const data of dataResponse) {

				const folio = await this.coreFolioRepository.findOneByFolioMultisistema(data.folioMultisistema);

				if (await this.resendNotificacion(folio._id.toString(), data.actividad)) {

					workflow.folio = folio._id.toString();

					await this.taskActividadRemindeRepository.create(folio._id.toString(), data.actividad);
					await this.coreFolioReportService.updateTaskRemiderByfolio(folio._id.toString())

					taskReminder.count = (await this.taskActividadRemindeRepository.findByFolioActividad(folio._id.toString(), data.actividad)).length;

					if ([EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO].includes(data.estatus)) {
						await this.coreNotificacionService.solicitud(i18n, null, "", workflow, taskReminder);
					}

					if (data.estatus == EEstatusActividad.EN_REPROCESO) {
						await this.coreNotificacionService.revision(i18n, null, "", workflow, taskReminder);
					}

				}

			}

		}

		this._logger.verbose('END::: TaskService (sendActividadReminder)');
	}


	private async resendNotificacion(folio: string, actividad: number) {

		const findFolioActividad = await this.taskActividadRemindeRepository.findByFolioActividad(folio, actividad);

		if (findFolioActividad.length == 0)
			return true;

		if (findFolioActividad.length > 2)
			return false;

		const resendNotificacion = await this.taskActividadRemindeRepository.resendNotificacion(folio);

		return (resendNotificacion.length) > 0 ? false : true;

	}

	private async isWorkingTime(): Promise<boolean> {

		const time = DateTime.now().setZone(process.env.MSH_TIME_ZONE,);
		const hourStart = 14; // 12:00pm
		const hourEnd = 17.30; // 5:30pm

		let horaActual = parseFloat(`${time.hour}.${time.minute}`);
		let holidays = await this.catDiaFestivoRepository.select();
		let isHoliday = false;

		if (time.weekday >= 1 && time.weekday <= 5) {
			isHoliday = holidays.some(holiday => {
				return holiday.day === time.day && holiday.month === time.month;
			})
		}

		return (
			time.weekday >= 1 &&
			time.weekday <= 5 &&
			horaActual >= hourStart &&
			horaActual < hourEnd &&
			!isHoliday
		);
	}

	@Cron('0 */3 * * * *')
	async sendReportNotification(): Promise<void> {
		this._logger.verbose('START::: TaskService (sendReportNotification)');
		const i18n: I18nContext = <I18nContext>{lang: AppConsts.APP.Language};
		const dataResponse =
			await this.taskReportNotificationRepository.findReportNotificationProcesado(
				false,
			);
		await Promise.all(
			dataResponse.map(async (data) => {
				const crDto = new CoreReporteRequestDto();
				crDto.destinatarios = data.destinatarios;
				crDto.fechaFin = data.fechaFin;
				crDto.fechaInicio = data.fechaInicio;
				crDto.tipoReporte = data.tipoReporte;
				await this.coreReporteService.sendReport(crDto, i18n);
				await this.taskReportNotificationRepository.updateProcesado(data._id);
			}),
		);
		this._logger.verbose('END::: TaskService (sendReportNotification)');
	}

	// @Cron(process.env.MSH_MIGRATION_HOUR || CronExpression.EVERY_DAY_AT_1AM)
	@Cron(CronExpression.EVERY_DAY_AT_1AM)
	async migracion() {
		this._logger.verbose('Start::: Migracion de folios');
		await this.coreFolioReportService.migrarFolio();
		this._logger.verbose('END::: Migracion de folios');
	}
}
