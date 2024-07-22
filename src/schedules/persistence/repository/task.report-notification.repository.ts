import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CoreReporteRequestDto } from 'src/endpoints/core/helpers/dtos/core.reporte.request.dto';
import {
  TaskReportNotification,
  TaskReportNotificationDocument,
} from '../database/task.report-notification.schema';

@Injectable()
export class TaskReportNotificationRepository {
  constructor(
    @InjectModel(TaskReportNotification.name)
    private readonly taskReportNotificationModel: Model<TaskReportNotificationDocument>,
  ) {}

  async findByProcesado(
    procesado: boolean,
  ): Promise<TaskReportNotification | null> {
    return await this.taskReportNotificationModel.findOne({ procesado }).exec();
  }

  async findReportNotificationProcesado(
    procesado: boolean,
  ): Promise<TaskReportNotification[]> {
    return await this.taskReportNotificationModel.find({ procesado }).exec();
  }

  async create(trn: CoreReporteRequestDto) {
    const created = new this.taskReportNotificationModel({
      destinatarios: trn.destinatarios,
      fechaInicio: trn.fechaInicio,
      fechaFin: trn.fechaFin,
      tipoReporte: trn.tipoReporte,
    });

    return await created.save();
  }

  async updateAddFolio(_id: string, folio: string) {
    return await this.taskReportNotificationModel
      .findByIdAndUpdate(
        _id,
        {
          $push: { folios: new Types.ObjectId(folio) },
        },
        { new: true },
      )
      .exec();
  }

  async updateProcesado(id: Types.ObjectId) {
    return await this.taskReportNotificationModel
      .findByIdAndUpdate(
        id,
        { procesado: true, fechaEnvio: new Date() },
        { new: true },
      )
      .exec();
  }
}
