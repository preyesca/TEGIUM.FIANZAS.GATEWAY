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
export class WorkflowRepository {
  constructor(
    @InjectModel(WorkflowActividad.name)
    private readonly workflowActividadModel: ModelExt<WorkflowActividadDocument>,
  ) {}

  async create(data: WorkflowActividadDto) {
    const created = new this.workflowActividadModel(data);
    return await created.save();
  }

  async findByProyectoFolio(
    proyecto: string,
    folioMultisistema: string,
  ): Promise<WorkflowActividad[]> {
    return this.workflowActividadModel.find({
      proyecto: new Types.ObjectId(proyecto),
      folioMultisistema,
    });
  }

  async findByFolio(folioMultisistema: string): Promise<WorkflowActividad[]> {
    return this.workflowActividadModel.find({folioMultisistema});
  }

  async finalizaActividad(
    id,
    usuario: string,
    proyecto: string,
    folioMultisistema: any,
    rol?: number,
  ) {
        const actividad = await this.workflowActividadModel.findById(id);
        const date: Date = new Date();

    if (actividad.estatus == EEstatusActividad.FINALIZADA) return true;
    actividad.fechaFinal = date;
    actividad.estatus =
      actividad.actividad === EKycActividad.CONFIRMACION_ENTREGA
        ? EEstatusActividad.FINALIZADA
        : EEstatusActividad.COMPLETADA;

    actividad.usuario = new Types.ObjectId(usuario);

    if (rol) actividad.rol = rol;

    if (actividad.actividad === EKycActividad.CONFIRMACION_ENTREGA) {
      const informacionExistente = await this.findByProyectoFolio(
        proyecto,
        folioMultisistema,
      );

      let actividadActual: any = informacionExistente.find(
        (x) =>
          x.actividad === EKycActividad.CONTACTO_TELEFONICO &&
          x.fechaFinal == null,
      );
      
      actividadActual.fechaFinal = date;
      actividadActual.usuario = new Types.ObjectId(usuario);
      actividadActual.estatus = EEstatusActividad.FINALIZADA;

      await this.workflowActividadModel.findByIdAndUpdate(
        actividadActual._id,
        actividadActual,
        {
          new: true,
        },
      );
    }

    return this.workflowActividadModel.findByIdAndUpdate(id, actividad, {
      new: true,
    });
  }
}
