import {Types} from "mongoose";
import {I18nService} from "nestjs-i18n";
import {Controller} from "@nestjs/common";
import {I18nTranslations} from "../../../../../app/translation/translate/i18n.translate";
import {
	FlowRecoleccionFisicosRepository
} from "../../../persistence/repository/flows/flow.recoleccion-fisicos.repository";
import {FlowRecoleccionFisicosDTO} from "../../helpers/dto/flows/flow.recoleccion-fisicos.dto";
import {SessionTokenDto} from "../../../../../app/common/dto/session-token.dto";
import {DefaultResponse} from "../../../../../app/common/response/default.response";
import {ResponseDto} from "../../../../../app/common/dto/response.dto";


@Controller()
export class FlowRecoleccionFisicosServices {

	constructor(
		private readonly recoleccionFisicosService: FlowRecoleccionFisicosRepository,
		private i18n: I18nService<I18nTranslations>,
	) {
	}

	async create(payload: {
		body: FlowRecoleccionFisicosDTO;
		session: SessionTokenDto;
		lang: string
	}) {
		payload.body.folio = new Types.ObjectId(payload.body.folio);
		if (payload.session) {
			payload.body.usuario = new Types.ObjectId(payload.session.usuario);
		}
		payload.body.archivo = new Types.ObjectId(payload.body.archivo);

		const formato = await this.recoleccionFisicosService.findOne(payload.body.folio.toString());

		if (formato) {
			await this.recoleccionFisicosService.updateByFolio(payload.body.folio.toString(), payload.body);
		} else {
			await this.recoleccionFisicosService.create(payload.body);
		}

		return DefaultResponse.sendOk(
			this.i18n.translate('all.MESSAGES.SUCCESS.SAVED', {
				lang: payload.lang,
			}),
			'',
		);
	}


	async findOneToEdit(
		payload: { id: string; session: SessionTokenDto; lang: string },
	): Promise<ResponseDto> {
		if (!Types.ObjectId.isValid(payload.id))
			return DefaultResponse.sendBadRequest(
				this.i18n.translate('all.VALIDATIONS.FIELD.ID_MONGO', {
					lang: payload.lang,
				}),
			);
		const dataValidacion = await this.recoleccionFisicosService.findOne(payload.id);
		return DefaultResponse.sendOk('', dataValidacion);
	}
}