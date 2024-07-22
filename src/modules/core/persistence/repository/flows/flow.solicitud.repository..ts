import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FlowSolicitud, FlowSolicitudDocument } from '../../database/flows/flow.solicitud.schema';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { NewFlowSolicitudDTO } from 'src/modules/core/domain/helpers/dto/flows/flow.solicitud.dto';
import { CoreFolio } from '../../database/core.folio.schema';

@Injectable()
export class FlowSolicitudRepository {
    constructor(
        @InjectModel(FlowSolicitud.name)
        private readonly model: ModelExt<FlowSolicitudDocument>,
    ) { }

    async create(createDto: NewFlowSolicitudDTO): Promise<FlowSolicitud> {
        const created = new this.model(createDto);
        return await created.save();
    }

    async findOne(id: string): Promise<FlowSolicitud> {
        return await this.model
            .findById(id)
            .exec();
    }

    async findOneByFolio(folio: string): Promise<FlowSolicitud> {
        return await this.model
            .findOne({ folio })
            .exec();
    }

    async update(id: string, updateDto: NewFlowSolicitudDTO): Promise<FlowSolicitud> {
        return await this.model
            .findByIdAndUpdate(id, updateDto, { new: true })
            .exec();
    }

    async selectToBandeja(paginate: any) {

        const { page, limit } = paginate;

        const options = {
            page,
            limit,
            populate: {
                path: 'folio',
                select: 'folioMultisistema',
                model: CoreFolio.name
            },
            select: 'aseguradora -_id',
        }

        return await this.model
            .paginate({}, options)
    }

}
