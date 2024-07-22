import {Controller} from '@nestjs/common';
import {Workbook} from 'exceljs';
import {I18nContext, I18nService} from 'nestjs-i18n';
import {DefaultResponse} from 'src/app/common/response/default.response';
import {I18nTranslations} from 'src/app/translation/translate/i18n.translate';
import {CoreReporteRequestDto} from 'src/endpoints/core/helpers/dtos/core.reporte.request.dto';
import {
	TaskReportNotificationRepository
} from 'src/schedules/persistence/repository/task.report-notification.repository';
import {CoreReportRepository} from '../../persistence/repository/core.report.repository';
import {CABECERA_REPORTE_SEGUIMIENTO} from '../helpers/constants/cabecera-reporte-seguimiento.const';
import {
	NotifyMarshReportesService
} from "../../../../notifications/domain/services/marsh/notify.marsh-reportes.service";
import {CoreFolioReportService} from "./core.folio-report.service";

@Controller()
export class CoreReporteService {
	constructor(
		private i18n: I18nService<I18nTranslations>,
		private readonly coreReportRepository: CoreReportRepository,
		private readonly notifyMarshReportesService: NotifyMarshReportesService,
		private readonly taskReportNotificationRepository: TaskReportNotificationRepository,
		private readonly coreFolioReportService: CoreFolioReportService,

	) {
	}

	async sendReport(
		data: CoreReporteRequestDto,
		i18n: I18nContext,
	): Promise<any> {
		let result: any[];
		switch (data.tipoReporte) {
			case 1:
				// result = await this.coreReportRepository.reportSeguimiento(
				result = await this.coreFolioReportService.getReportSeguimiento(
					data.fechaInicio.toISOString(),
					data.fechaFin.toISOString(),
				);
				break;
		}

		const workbook = new Workbook();
		const sheet = workbook.addWorksheet('Hoja1');
		sheet.columns = CABECERA_REPORTE_SEGUIMIENTO.map((v) => {
			const width = v.length * 1.5;
			return {
				header: v.toUpperCase(),
				key: v.toLowerCase(),
				width: width < 20 ? 20 : width,
			};
		});

		sheet.insertRows(2, result);
		const headerRow = sheet.getRow(1);
		headerRow.height = 45;
		headerRow.alignment = {
			horizontal: 'center',
			vertical: 'middle',
		};
		headerRow.eachCell((cell) => {
			cell.fill = {
				type: 'pattern',
				pattern: 'solid',
				fgColor: {argb: '000000'},
			};
			cell.font = {
				color: {argb: 'FFFFFF'},
				bold: true,
			};
		});


		const buf = await workbook.xlsx.writeBuffer();



		await this.notifyMarshReportesService.seguimiento(i18n, {
			fechaInicio: data.fechaInicio.toJSON().slice(0, 10),
			fechaFin: data.fechaFin.toJSON().slice(0, 10),
			mailOptions: {
				to: data.destinatarios,
				cc: undefined,
				attachments: [
					{
						value: buf as any,
						valueType: 'arrayBuffer',
						filename: 'Reporte_de_seguimiento.xlsx',
						contentType: 'application/vnd.ms-excel',
					},
				],
			},
		});
		return;
	}

	async create(data: CoreReporteRequestDto, i18n: I18nContext) {
		await this.taskReportNotificationRepository.create(data);
		return DefaultResponse.sendOk(
			this.i18n.translate('core.REPORTE.SUCCESS.SEND_REPORT', {
				lang: i18n.lang,
			}),
			null,
		);
	}
}
