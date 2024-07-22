import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskActividadReminder, TaskActividadReminderSchema } from './persistence/database/task.actividad-reminder.schema';
import { TaskActividadReminderRepository } from './persistence/repository/task.actividad-reminder.repository';
import { WorkflowActividad, WorkflowActividadSchema } from 'src/modules/workflow/persistence/database/workflow.actividad.schema';
import { WorkflowActividadRepository } from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import { CoreFolio, CoreFolioSchema } from 'src/modules/core/persistence/database/core.folio.schema';
import { CoreFolioRepository } from 'src/modules/core/persistence/repository/core.folio.repository';
import { TaskService } from './domain/services/task.service';
import { CoreModule } from 'src/modules/core/core.module';
import {TaskReportNotificationRepository} from "./persistence/repository/task.report-notification.repository";
import {
  TaskReportNotification,
  TaskReportNotificationSchema
} from "./persistence/database/task.report-notification.schema";
import { CatDiaFestivoRepository } from 'src/modules/catalogo/persistence/repository/cat.dia-festivo.repository';
import { CatDiaFestivo, CatDiaFestivoSchema } from 'src/modules/catalogo/persistence/database/cat.dia-festivo.schema';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: CoreFolio.name,
        useFactory: () => CoreFolioSchema,
      },
      {
        name: CatDiaFestivo.name,
        useFactory: () => CatDiaFestivoSchema,
      },
      {
        name: TaskActividadReminder.name,
        useFactory: () => TaskActividadReminderSchema,
      },
      {
        name: WorkflowActividad.name,
        useFactory: () => WorkflowActividadSchema,
      },
      {
        name: TaskReportNotification.name,
        useFactory: () => TaskReportNotificationSchema,
      },
    ]),
    CoreModule
  ],

  providers: [
    TaskService,
    CoreFolioRepository,
    CatDiaFestivoRepository,
    TaskActividadReminderRepository,
    WorkflowActividadRepository,
	  TaskReportNotificationRepository
  ],
})
export class TaskSchedulingModule { }
