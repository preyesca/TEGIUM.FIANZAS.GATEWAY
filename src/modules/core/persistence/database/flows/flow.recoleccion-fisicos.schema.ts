import {HydratedDocument, Types} from "mongoose";
import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {SchemaPrefix} from "../../../../../app/common/consts/schema-prefix.consts";

export  type FlowRecoleccionFisicosDocument = HydratedDocument<FlowRecoleccionFisicos>

@Schema({
	collection: SchemaPrefix.setFLUJO('recoleccion-fisicos'),
	timestamps: false,
	versionKey: false,
})
export class FlowRecoleccionFisicos {

	@Prop({required: true})
	folio: Types.ObjectId;

	@Prop({required: true})
	archivo: Types.ObjectId;

	@Prop({})
	usuario: Types.ObjectId;

	@Prop({required: false})
	claveGuia: string;
}

export const FlowRecoleccionFisicosSchema = SchemaFactory.createForClass(FlowRecoleccionFisicos);