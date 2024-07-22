import {Controller} from '@nestjs/common';
import {Types} from 'mongoose';
import {I18nService} from 'nestjs-i18n';
import {I18nTranslations} from 'src/app/translation/translate/i18n.translate';
import {BitActividadRepository} from '../../persistence/repository/bit.actividad.repository';
import {CatActividadRepository} from 'src/modules/catalogo/persistence/repository/cat.actividad.repository';
import {CoreFolioRepository} from 'src/modules/core/persistence/repository/core.folio.repository';
import {
	BitActividadDto,
	BitOutDetailsDto,
	OrdenandoComentarioDto,
	SelectFolioDetailsDto
} from '../dto/bit.actividad.dto';
import {ResponseDto} from 'src/app/common/dto/response.dto';
import {DefaultResponse} from 'src/app/common/response/default.response';
import {IPaginateParams} from 'src/app/common/interfaces/paginate-params';
import {CoreComentarioService} from 'src/modules/core/domain/services/core.comentario.service';
import { EComentario } from 'src/modules/core/domain/helpers/enum/core.comentario';

@Controller()
export class BitActividadService {
	constructor(
		private readonly bitActividadRepository: BitActividadRepository,
		private readonly catActividadRepository: CatActividadRepository,
		private readonly coreFolioRepository: CoreFolioRepository,
		private readonly coreComentarioService: CoreComentarioService,
		private i18n: I18nService<I18nTranslations>,
	) {
	}

	async create(payload: {
		data: BitActividadDto;
		lang: string;
	}): Promise<ResponseDto> {
		if (
			!(await this.coreFolioRepository.findOneExists(
				payload.data.folio.toString(),
			))
		) {
			return DefaultResponse.sendNotFound(
				this.i18n.translate('core.VALIDATIONS.NOT_FOUND.FOLIO', {
					// this.i18n.translate('core.', {
					lang: payload.lang,
				}),
			);
		}

		if (
			!(await this.catActividadRepository.findOneByClave(
				payload.data.actividad,
			))
		) {
			return DefaultResponse.sendNotFound(
				this.i18n.translate('bitacora.VALIDATIONS.NOT_FOUND.ACTIVIDAD', {
					lang: payload.lang,
				}),
			);
		}

		if (payload.data.usuario) {
			payload.data.usuario = new Types.ObjectId(payload.data.usuario);
		}

		payload.data.folio = new Types.ObjectId(payload.data.folio);

		const created = await this.bitActividadRepository.create(payload.data);

		return DefaultResponse.sendOk(
			this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
				lang: payload.lang,
			}),
			created,
		);
	}

	async selectByFolio(payload: {
		paginate: IPaginateParams;
		lang: string;
		idFolio: string;
	}) {

		const bitacoraActividades = await this.bitActividadRepository.selectByFolio(
			payload.idFolio,
			payload.paginate,
		);

		if (bitacoraActividades.docs.length == 0)
			return {
				success: true,
				message: this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
					lang: payload.lang,
				}),
				data: [],
			};

		const actividadesFiltro = [
			...new Set<number>(
				bitacoraActividades.docs.map(({actividad}) => actividad.toString()),
			),
		];

		const actividades = await this.catActividadRepository.selectInByClave(
			actividadesFiltro,
		);

		let BitOutDetails: BitOutDetailsDto[] = [];
		bitacoraActividades.docs.forEach((bitacoraActividad) => {
			const actividad = actividades.find(
				(x: any) => x._id === bitacoraActividad.actividad.toString(),
			);
			bitacoraActividad.actividad = actividad;
			BitOutDetails.push(bitacoraActividad);
		});

		return {success: true, message: '', data: bitacoraActividades};
	}

	async selectLastStatusByFolio(folio: string) {
		return await this.bitActividadRepository.selectLastStatusByFolio(folio);
	}

	async selectInByFoliosBandeja(folios: any) {
		return await this.bitActividadRepository.selectInByFoliosBandeja(folios);
	}

	async selectByFolioForDetalle(payload: SelectFolioDetailsDto) {
		const objectIdFolio = new Types.ObjectId(payload.data);
		if (!Types.ObjectId.isValid(objectIdFolio))
			return {
				success: false,
				message: this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
					lang: payload.lang,
				}),
				data: null,
			};

		const bitacoraActividades =
			await this.bitActividadRepository.selectByFolioForDetalle(
				objectIdFolio,
				payload.paginate,
			);

		if (bitacoraActividades.docs.length == 0)
			return {
				success: true,
				message: this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
					lang: payload.lang,
				}),
				data: [],
			};

		const actividadesFiltro = [
			...new Set<number>(
				bitacoraActividades.docs.map(({actividad}) => actividad),
			),
		];

		const actividadFindName = await this.catActividadRepository.selectInByClave(
			actividadesFiltro,
		);

		const comentarios = await this.coreComentarioService.findAll({
			folio: objectIdFolio.toString(),
		});

		if (!comentarios)
			return {
				success: true,
				message: this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
					lang: payload.lang,
				}),
				data: [],
			};

		let uniqueCo = await this.ordenandoComentarios(
			comentarios.data[0].actividades,
		);

		await this.identifySolicitud(uniqueCo); //Colocara el comentario mas reciente de solicitud


		uniqueCo = uniqueCo.slice(
			(+payload.paginate.page - 1) * +payload.paginate.limit,
			+payload.paginate.page * +payload.paginate.limit
		);

		if (uniqueCo.length == 0) {

			const regNew = {
				bitacora: null,
				actividad: null,
				fecha: new Date(),
				comentarios: '',
			};

			uniqueCo.push(regNew);
		}

		const cantRegis = bitacoraActividades.docs.length - uniqueCo.length;
		if (bitacoraActividades.docs.length > cantRegis) {
			const regNew = {
				bitacora: null,
				actividad: null,
				fecha: new Date(),
				comentarios: '',
			};

			for (let i = 0; i < cantRegis; i++) {
				uniqueCo.push(regNew);
			}
		}

		comentarios.data[0].actividades = uniqueCo;

		for (const [i, elementoB] of bitacoraActividades.docs.entries()) {
			comentarios.data[0].actividades[i].bitacora = elementoB._id;
		}

		const modifiedDocs = bitacoraActividades.docs.map((bitacoraActividad) => {
			const actividad = comentarios.data[0].actividades.find(
				(item) => item.bitacora === bitacoraActividad._id,
			);

			const actividadName = actividadFindName.find(
				(item) => item.clave === bitacoraActividad.actividad,
			);

			return {
				_id: bitacoraActividad._id,
				folio: bitacoraActividad.folio,
				actividad: actividadName?.descripcion ?? '',
				usuario: bitacoraActividad.usuario,
				estatusBitacora: bitacoraActividad.estatusBitacora,
				fecha: bitacoraActividad.fecha,
				comentarios: actividad?.comentarios ?? '',
			};
		});

		return DefaultResponse.sendOk(
			this.i18n.translate('all.VALIDATIONS.DATA.EXISTS.GENERAL', {
				lang: payload.lang,
			}),
			{
				docs: modifiedDocs,
				totalDocs: bitacoraActividades.totalDocs,
				limit: bitacoraActividades.limit,
				totalPages: bitacoraActividades.totalPages,
				page: bitacoraActividades.page,
			},
		);
	}

	async ordenandoComentarios(purga: OrdenandoComentarioDto[]) {
		const purgaFiltrada = purga.sort(
			(a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
		);

		return purgaFiltrada.filter(
			(elemento) => !elemento.comentarios.includes(EComentario.BITACORA_TRANSICION),
		);
		;
	}

	async identifySolicitud(data: any) {
		if (data[0].actividad == 2 && data[1].actividad == 2) {
			data.splice(1, 1);
		}
		return data;
	}
}
