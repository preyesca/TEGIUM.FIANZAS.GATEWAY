import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { SchemaPrefix } from 'src/app/common/consts/schema-prefix.consts';

export type FlowSolicitudDocument = HydratedDocument<FlowSolicitud>;

@Schema({
    collection: SchemaPrefix.setFLUJO('solicitudes'),
    timestamps: false,
    versionKey: false,
})
export class FlowSolicitud {
    @Prop({ required: true })
    folio: Types.ObjectId;

    @Prop({ required: false })
    informacionEjecutivo: Types.ObjectId;

    @Prop({ required: false })
    informacionContacto: Types.ObjectId;

    @Prop({ required: false })
    telefonosContacto: [Types.ObjectId];

    @Prop({ required: false })
    numeroUnidad: string;

    @Prop({ required: false })
    fechaVigencia: Date;

    @Prop({ required: false })
    aseguradora: Types.ObjectId;
}

export const FlowSolicitudSchema = SchemaFactory.createForClass(FlowSolicitud);
