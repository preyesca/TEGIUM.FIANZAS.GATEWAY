import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { TaskActividadReminder, TaskActividadReminderDocument } from '../database/task.actividad-reminder.schema';

@Injectable()
export class TaskActividadReminderRepository {

  private readonly _taskHourReminder = process.env.MSH_TASK_NOTIFICATIONS_REMINDER_EVERY;
  private readonly timeUnit = this._taskHourReminder.includes('h') ? 'hour' : 'minute';
  private readonly time = this._taskHourReminder.includes('h') ? Number(this._taskHourReminder.split('h')[0]) : Number(this._taskHourReminder.split('m')[0]);

  constructor(
    @InjectModel(TaskActividadReminder.name)
    private readonly taskActividadReminderModel: Model<TaskActividadReminderDocument>,
  ) { }

  async create(folio: string, actividad: number) {
    const created = new this.taskActividadReminderModel({
      folio: new Types.ObjectId(folio),
      actividad
    });
    return await created.save();
  }

  async findByFolioActividad(folio: string, actividad: number) {

    return await this.taskActividadReminderModel.find({
      folio: new Types.ObjectId(folio),
      actividad
    }).exec()

  }

  async resendNotificacion(folio: string) {

    return await this.taskActividadReminderModel.aggregate([

      {
        $match: {
          folio: { $eq: new Types.ObjectId(folio) }
        }
      },
      {
        $sort: {
          fechaEnvio: -1
        }
      },
      {
        $limit: 1
      },
      {
        $match: {
          $expr: {
            $lt: [
              {
                $dateDiff: {
                  startDate: "$fechaEnvio",
                  endDate: "$$NOW",
                  unit: this.timeUnit
                }
              },
              this.time
            ]
          }
        }
      }
    ])

  }

}
