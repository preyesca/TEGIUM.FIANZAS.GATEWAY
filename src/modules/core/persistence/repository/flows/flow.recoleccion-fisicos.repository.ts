import {Types} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {ModelExt} from "../../../../../app/utils/extensions/model.extension";
import {
	FlowRecoleccionFisicos,
	FlowRecoleccionFisicosDocument
} from "../../database/flows/flow.recoleccion-fisicos.schema";
import {FlowRecoleccionFisicosDTO} from "../../../domain/helpers/dto/flows/flow.recoleccion-fisicos.dto";

@Injectable()
export class FlowRecoleccionFisicosRepository {

	constructor(@InjectModel(FlowRecoleccionFisicos.name)
	            private readonly flowRecoleccionFisicosModel: ModelExt<FlowRecoleccionFisicosDocument>) {
	}

	async create(createDto: FlowRecoleccionFisicosDTO): Promise<FlowRecoleccionFisicosDTO> {
		const created = new this.flowRecoleccionFisicosModel(createDto);
		return await created.save();
	}

	async findOne(id: string) {
		return await this.flowRecoleccionFisicosModel.findOne({folio: new Types.ObjectId(id)}).exec();
	}

	async updateByFolio(id: string, updateDto: FlowRecoleccionFisicosDTO): Promise<FlowRecoleccionFisicosDTO> {
		return await this.flowRecoleccionFisicosModel
			.findOneAndUpdate({folio: new Types.ObjectId(id)}, updateDto, {new: true})
			.exec();
	}
}