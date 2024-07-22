import { Controller } from '@nestjs/common';
import { Types } from 'mongoose';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { CatReporte } from '../../persistence/database/cat.reporte.schema';
import {CatReporteRepository} from "../../persistence/repository/cat.reporte.repository";

@Controller()
export class CatReporteService {
	constructor(private readonly catReporteRepository: CatReporteRepository) {}

	async select(): Promise<ResponseDto> {
		const data = await this.catReporteRepository.select();
		return DefaultResponse.sendOk('', data);
	}

	async findOne(id: string, @I18n() i18n: I18nContext): Promise<ResponseDto> {
		if (!Types.ObjectId.isValid(id))
			return DefaultResponse.sendBadRequest(
				i18n.t('all.VALIDATIONS.FIELD.ID_MONGO'),
			);

		const data = await this.catReporteRepository.findOne(id);

		return data
			? DefaultResponse.sendOk('', data)
			: DefaultResponse.sendNotFound(
				i18n.t('catalogos.VALIDATIONS.NOT_FOUND.UNIDAD'),
			);
	}

	async findOneByClave(clave: number): Promise<CatReporte> {
		return await this.catReporteRepository.findOneByClave(clave);
	}

	async findOneByDescription(description: string): Promise<CatReporte> {
		return await this.catReporteRepository.findOneByDescription(description);
	}

	async selectIn(ids: string[]): Promise<CatReporte[]> {
		return await this.catReporteRepository.selectIn(ids);
	}

	async selectInByClave(claves: number[]): Promise<CatReporte[]> {
		return await this.catReporteRepository.selectInByClave(claves);
	}
}
