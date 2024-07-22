import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { EEstatusActividad } from 'src/app/common/enum/estatus-actividad.enum';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import { WorkflowActividadDto } from '../../domain/dto/workflow.actividad.dto';
import {
  WorkflowActividad,
  WorkflowActividadDocument,
} from '../database/workflow.actividad.schema';

@Injectable()
export class WorkflowConsultarRepository {
  constructor(
    @InjectModel(WorkflowActividad.name)
    private readonly workflowActividadModel: ModelExt<WorkflowActividadDocument>,
  ) {}

  async create(data: WorkflowActividadDto) {
    const created = new this.workflowActividadModel(data);
    return await created.save();
  }

  async findByProyectoFolio(proyecto: string, folioMultisistema: string) {
    return this.workflowActividadModel.find({
      proyecto,
      folioMultisistema,
    });
  }

  async findByIdActividad(idActividad: string) {
    return this.workflowActividadModel.find({_id: idActividad});
  }

  async findByFolio(folio: number, actividad: number, proyecto: string) {
    return this.workflowActividadModel.find({
      folioMultisistema: folio,
      actividad: actividad,
      proyecto: new Types.ObjectId(proyecto),
    });
  }

  async findActividadesByFolio(
    folioMultisistema: number,
    proyecto: string,
  ): Promise<WorkflowActividad[]> {
    return this.workflowActividadModel.find({
      folioMultisistema: folioMultisistema,
      proyecto: new Types.ObjectId(proyecto),
    });
  }

  async findActividadesByFolioPaginated(
    folio: number,
    proyecto: Types.ObjectId,
    paginate: any,
  ): Promise<any> {
    return await this.workflowActividadModel.paginate(
      { folioMultisistema: folio, proyecto: new Types.ObjectId(proyecto) },
      { ...paginate, sort: { fechaAlta: 1 } },
    );
  }

  async findActividadesToCancelarByFolio(
      folioMultisistema: number,
      proyecto: string,
  ): Promise<WorkflowActividad[]> {
    return this.workflowActividadModel.find({
      folioMultisistema: folioMultisistema,
      proyecto: new Types.ObjectId(proyecto),
      estatus: {
        $not: {$eq: EEstatusActividad.COMPLETADA},
      },
      actividad: {
        $not: {$eq: EKycActividad.CONTACTO_TELEFONICO},
      },
    });
  }

}
