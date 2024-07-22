import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EEstatusActividad } from 'src/app/common/enum/estatus-actividad.enum';
import { EKycActividad } from 'src/app/common/enum/kyc/kyc.actividad.enum';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { ModelExt } from 'src/app/utils/extensions/model.extension';
import {
  WorkflowActividad,
  WorkflowActividadDocument,
} from '../database/workflow.actividad.schema';
import { EPerfil } from 'src/app/common/enum/kyc/kyc.perfil.enum';

const lstActividadesAnalista = [EKycActividad.SOLICITUD, EKycActividad.CONTACTO_ASEGURADORA];
const lstActividadesEjecutivo = [EKycActividad.SOLICITUD, EKycActividad.CARGA_DOCUMENTAL, EKycActividad.VALIDACION_DIGITAL,
EKycActividad.FIRMA_CLIENTE, EKycActividad.VALIDACION_FIRMAS, EKycActividad.VALIDACION_AFIANZADORA, EKycActividad.RECOLECCION_FISICOS,
EKycActividad.VALIDACION_ORIGINALES, EKycActividad.CONFIRMACION_ENTREGA, EKycActividad.CONTACTO_TELEFONICO];


@Injectable()
export class WorkflowActividadRepository {

  private readonly _taskHourReminder = process.env.MSH_TASK_NOTIFICATIONS_REMINDER_EVERY;
  private readonly timeUnit = this._taskHourReminder.includes('h') ? 'hour' : 'minute';
  private readonly time = this._taskHourReminder.includes('h') ? Number(this._taskHourReminder.split('h')[0]) : Number(this._taskHourReminder.split('m')[0]);

  constructor(
    @InjectModel(WorkflowActividad.name)
    private readonly workflowActividadModel: ModelExt<WorkflowActividadDocument>,
  ) { }

  async entradas(
    paginate: IPaginateParams,
    folioMultisistemaList: number[],
    perfil: number
  ) {
    let matchQuery: any[] = [];

    if (perfil === EPerfil.ANALISTA_INGRESO) {
      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $in: [EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO] } },
                { actividad: { $in: lstActividadesAnalista } },
                { actividad: { $not: { $eq: EKycActividad.FIN } } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $in: [EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO] } },
                { actividad: { $nin: lstActividadesEjecutivo } },
                { actividad: { $not: { $eq: EKycActividad.FIN } } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]
        }
      });
    }

    if (perfil === EPerfil.EJECUTIVO_MESA) {
      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $in: [EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO] } },
                { actividad: { $in: lstActividadesEjecutivo } },
                { actividad: { $not: { $eq: EKycActividad.FIN } } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $in: [EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO] } },
                { actividad: { $nin: lstActividadesAnalista } },
                { actividad: { $not: { $eq: EKycActividad.FIN } } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]

        }
      });
    }

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async reprocesos(
    paginate: IPaginateParams,
    folioMultisistemaList: number[],
    perfil: number
  ) {
    let matchQuery: any[] = [];

    if (perfil === EPerfil.ANALISTA_INGRESO) {
      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.EN_REPROCESO } },
                { actividad: { $in: lstActividadesAnalista } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.EN_REPROCESO } },
                { actividad: { $nin: lstActividadesEjecutivo } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]

        }
      });
    }

    if (perfil === EPerfil.EJECUTIVO_MESA) {
      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.EN_REPROCESO } },
                { actividad: { $in: lstActividadesEjecutivo } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.EN_REPROCESO } },
                { actividad: { $nin: lstActividadesAnalista } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]
        }
      });
    }

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async suspendidas(
    paginate: IPaginateParams,
    folioMultisistemaList: number[],
    perfil: number
  ) {
    let matchQuery: any[] = [];

    if (perfil === EPerfil.ANALISTA_INGRESO) {

      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.SUSPENDIDA } },
                { actividad: { $in: lstActividadesAnalista } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.SUSPENDIDA } },
                { actividad: { $nin: lstActividadesEjecutivo } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]

        }
      });
    }

    if (perfil === EPerfil.EJECUTIVO_MESA) {

      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.SUSPENDIDA } },
                { actividad: { $in: lstActividadesEjecutivo } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.SUSPENDIDA } },
                { actividad: { $nin: lstActividadesAnalista } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]
        }
      });
    }


    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async programadas(
    paginate: IPaginateParams,
    folioMultisistemaList: number[],
    perfil: number
  ) {
    let matchQuery: any[] = [];

    if (perfil === EPerfil.ANALISTA_INGRESO) {

      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.PROGRAMADA } },
                { actividad: { $in: lstActividadesAnalista } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.PROGRAMADA } },
                { actividad: { $nin: lstActividadesEjecutivo } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]

        }
      });
    }

    if (perfil === EPerfil.EJECUTIVO_MESA) {

      matchQuery.push({
        $match: {
          $or: [
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.PROGRAMADA } },
                { actividad: { $in: lstActividadesEjecutivo } },
                { rol: { $eq: perfil } }
              ]
            },
            {
              $and: [
                { estatus: { $eq: EEstatusActividad.PROGRAMADA } },
                { actividad: { $nin: lstActividadesAnalista } },
                { rol: { $not: { $eq: perfil } } }
              ]
            }
          ]

        }
      });
    }

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async busquedas(
    paginate: IPaginateParams,
    showFinalizados: string,
    session: SessionTokenDto,
    folioMultisistemaList: number[],
  ) {
    const proyectoFilter = new Types.ObjectId(session.proyecto);

    let matchQuery: any[] = [];

    if (showFinalizados == '2') {
      matchQuery.push({
        $match: {
          $or: [
            { estatus: { $eq: EEstatusActividad.CANCELADA } },
            { estatus: { $eq: EEstatusActividad.FINALIZADA } },
          ],
          $and: [{ proyecto: { $eq: proyectoFilter } }],
        },
      });
    } else {
      matchQuery.push({
        $match: {
          $or: [
            { estatus: { $eq: EEstatusActividad.NUEVA } },
            { estatus: { $eq: EEstatusActividad.EN_PROGRESO } },
            { estatus: { $eq: EEstatusActividad.EN_REPROCESO } },
            { estatus: { $eq: EEstatusActividad.SUSPENDIDA } },
          ],
          $and: [
            { actividad: { $not: { $eq: EKycActividad.FIN } } },
            { proyecto: { $eq: proyectoFilter } },
          ],
        },
      });
    }

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async findOne(
    folioMultisistema: number,
    actividad: number,
    session: SessionTokenDto,
  ): Promise<any> {
    return await this.workflowActividadModel
      .findOne({
        folioMultisistema,
        actividad,
        proyecto: new Types.ObjectId(session.proyecto),
      })
      .select('_id actividad')
      .exec();
  }

  async selectByFolioActividad(
    folioMultisistema: number,
    actividad: number,
    session: SessionTokenDto,
  ): Promise<any> {
    return await this.workflowActividadModel
      .findOne({
        folioMultisistema,
        actividad,
        proyecto: new Types.ObjectId(session.proyecto),
      })
      .exec();
  }

  async update(id: string, estatus: number) {
    return this.workflowActividadModel
      .updateOne({ _id: id }, { $set: { estatus } })
      .exec();
  }

  async findUltimaActividadAndEstatus(
    folioMultisistema: number,
    session: SessionTokenDto,
  ) {
    const proyectoFilter = new Types.ObjectId(session.proyecto);
    return this.workflowActividadModel.aggregate([
      {
        $match: {
          $and: [
            { folioMultisistema: { $eq: folioMultisistema } },
            {
              actividad: {
                $not: {
                  $in: [
                    EKycActividad.CONTACTO_TELEFONICO,
                    EKycActividad.CONTACTO_ASEGURADORA,
                  ],
                },
              },
            },
            { proyecto: { $eq: proyectoFilter } },
          ],
        },
      },
      {
        $sort: { fechaAlta: 1 },
      },
      {
        $group: {
          _id: {
            folio: '$folio',
          },
          actividades: {
            $last: '$$ROOT',
          },
        },
      },
      { $unset: '_id' },
    ]);
  }

  async findContactoTelefonicoAndContactoAseguradora(
    folioMultisistema: number,
    session: SessionTokenDto,
  ) {
    const proyectoFilter = new Types.ObjectId(session.proyecto);

    return this.workflowActividadModel.aggregate([
      {
        $match: {
          $and: [
            { folioMultisistema: { $eq: folioMultisistema } },
            {
              actividad: {
                $in: [
                  EKycActividad.CONTACTO_TELEFONICO,
                  EKycActividad.CONTACTO_ASEGURADORA,
                ],
              },
            },
            { proyecto: { $eq: proyectoFilter } },
          ],
        },
      },
    ]);
  }

  async findUltimaActividadByFolio(data: number[]) {
    return this.workflowActividadModel.aggregate([
      {
        $match: {
          $and: [
            { folioMultisistema: { $in: data } },
            {
              actividad: {
                $in: [
                  EKycActividad.CARGA_DOCUMENTAL,
                  EKycActividad.FIRMA_CLIENTE,
                  EKycActividad.RECOLECCION_FISICOS,
                ],
              },
            },
          ],
        },
      },
      {
        $sort: { fechaAlta: 1 },
      },
      {
        $group: {
          _id: {
            folioMultisistema: '$folioMultisistema',
          },
          actividades: {
            $last: '$$ROOT',
          },
        },
      },
      { $unset: '_id' },
    ]);
  }

  async findSolicitudByProyecto(param: any, session: SessionTokenDto) {
    const proyectoFilter = new Types.ObjectId(session.proyecto);
    let matchQuery: any[] = [
      {
        $match: {
          $and: [
            { actividad: { $eq: EKycActividad.SOLICITUD } },
            { proyecto: { $eq: proyectoFilter } },
            {
              estatus: {
                $in: [EEstatusActividad.NUEVA, EEstatusActividad.EN_PROGRESO],
              },
            },
          ],
        },
      },
    ];

    const options = {
      page: param.page,
      limit: 500,
    };

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async findUltimaActividadByFolioPortal(data: number[]) {
    return this.workflowActividadModel.aggregate([
      {
        $match: {
          $and: [
            { folioMultisistema: { $in: data } },
            {
              actividad: {
                $in: [
                  EKycActividad.CARGA_DOCUMENTAL,
                  EKycActividad.FIRMA_CLIENTE,
                  EKycActividad.RECOLECCION_FISICOS,
                ],
              },
            },
            {
              estatus: {
                $in: [
                  EEstatusActividad.NUEVA,
                  EEstatusActividad.EN_PROGRESO,
                  EEstatusActividad.EN_REPROCESO,
                ],
              },
            },
          ],
        },
      },
      {
        $sort: { fechaAlta: 1 },
      },
      {
        $group: {
          _id: {
            folio: '$folio',
          },
          actividades: {
            $last: '$$ROOT',
          },
        },
      },
      { $unset: '_id' },
    ]);
  }

  async findAllListaNegra(
    paginate: IPaginateParams,
    session: SessionTokenDto,
    folioMultisistemaList: number[],
  ) {
    const proyectoFilter = new Types.ObjectId(session.proyecto);
    let matchQuery: any[] = [
      {
        $match: {
          $and: [
            { actividad: { $gt: 4 } },
            { actividad: { $not: { $eq: EKycActividad.CONTACTO_TELEFONICO } } },
            { estatus: { $not: { $eq: EEstatusActividad.FINALIZADA } } },
            { estatus: { $not: { $eq: EEstatusActividad.COMPLETADA } } },
            { proyecto: { $eq: proyectoFilter } },
          ],
        },
      },
    ];

    let options: any = {
      limit: paginate.limit,
      page: paginate.page,
    };

    if (paginate.order && paginate.sort) {
      matchQuery.push({
        $sort: {
          [paginate.order]: paginate.sort == 'asc' ? 1 : -1,
        },
      });
    }

    if (folioMultisistemaList.length == 0 && paginate.search != '') {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: [] } }],
        },
      });
    }

    if (folioMultisistemaList.length > 0) {
      matchQuery.push({
        $match: {
          $and: [{ folioMultisistema: { $in: folioMultisistemaList } }],
        },
      });
    }

    const agregate = this.workflowActividadModel.aggregate(matchQuery);
    const actividades = await this.workflowActividadModel.aggregatePaginate(
      agregate,
      options,
    );

    if (!actividades || actividades.docs.length == 0) return null;

    return actividades;
  }

  async cancelar(actividades: string[], usuario: string) {
    return await this.workflowActividadModel
      .updateMany(
        { _id: { $in: actividades } },
        {
          $set: {
            estatus: EEstatusActividad.CANCELADA,
            usuario: new Types.ObjectId(usuario),
          },
        },
      )
      .exec();
  }

  async findActividadesNotificacion() {

    return this.workflowActividadModel.aggregate([
      {
        $match: {
          actividad: { $eq: EKycActividad.CARGA_DOCUMENTAL },
          estatus: {
            $in: [
              EEstatusActividad.NUEVA,
              EEstatusActividad.EN_PROGRESO,
              EEstatusActividad.EN_REPROCESO
            ]
          },
          $expr: {
            $gte: [
              {
                $dateDiff: {
                  startDate: "$fechaAlta",
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
