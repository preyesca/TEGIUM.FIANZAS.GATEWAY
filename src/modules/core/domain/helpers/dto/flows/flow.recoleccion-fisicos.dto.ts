import {Types} from "mongoose";


export class FlowRecoleccionFisicosDTO {
	folio: Types.ObjectId;
	archivo: Types.ObjectId;
	usuario?: Types.ObjectId;
	claveGuia: string;
}
