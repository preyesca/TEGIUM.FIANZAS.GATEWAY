// fecha de actualizacion de query : 03/05/2024
const REPORTE_SEGUIMIENTO: any[] = [
  {
    $lookup: {
      from: 'core.titulares',
      localField: 'titular',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            _id: 1,
            numeroCliente: 1,
            nombre: 1,
            tipoPersona: 1,
          },
        },
      ],
      as: 'titulare_info',
    },
  },
  {
    $unwind: '$titulare_info',
  },
  {
    $lookup: {
      from: 'core.polizas',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $project: {
            _id: 0,
            riesgo: 1,
            unidad: 1,
            aseguradora: 1,
            fechaVigencia: 1,
          },
        },
      ],
      as: 'poliza_info',
    },
  },
  {
    $unwind: '$poliza_info',
  },
  {
    $lookup: {
      from: 'cat.unidades',
      localField: 'poliza_info.unidad',
      foreignField: 'clave',
      pipeline: [
        {
          $project: {
            _id: 0,
            clave: 1,
            descripcion: 1,
          },
        },
      ],
      as: 'unidad_info',
    },
  },
  {
    $unwind: '$unidad_info',
  },
  {
    $lookup: {
      from: 'cat.riesgos',
      localField: 'poliza_info.riesgo',
      foreignField: 'clave',
      pipeline: [
        {
          $project: {
            _id: 0,
            clave: 1,
            descripcion: 1,
          },
        },
      ],
      as: 'riesgo_info',
    },
  },
  {
    $unwind: '$riesgo_info',
  },
  {
    $lookup: {
      from: 'cat.tipos-movimiento',
      localField: 'tipoMovimiento',
      foreignField: 'clave',
      pipeline: [
        {
          $project: {
            _id: 0,
            clave: 1,
            descripcion: 1,
          },
        },
      ],
      as: 'tipoMovimiento',
    },
  },
  {
    $unwind: '$tipoMovimiento',
  },
  {
    $lookup: {
      from: 'adm.proyectos',
      localField: 'proyecto',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            _id: 1,
            aseguradora: 1,
          },
        },
      ],
      as: 'proyecto_info',
    },
  },
  {
    $unwind: '$proyecto_info',
  },
  {
    $lookup: {
      from: 'adm.aseguradoras',
      localField: 'poliza_info.aseguradora',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            _id: 1,
            nombreComercial: 1,
          },
        },
      ],
      as: 'aseguradora_info',
    },
  },
  {
    $unwind: '$aseguradora_info',
  },
  {
    $lookup: {
      from: 'adm.usuarios',
      localField: 'usuario',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            _id: 0,
            primerApellido: 1,
            segundoApellido: 1,
            nombre: 1,
          },
        },
        {
          $addFields: {
            nombreCompleto: {
              $concat: [
                {
                  $ifNull: ['$nombre', ''],
                },
                ' ',
                {
                  $ifNull: ['$primerApellido', ''],
                },
                ' ',
                {
                  $ifNull: ['$segundoApellido', ''],
                },
              ],
            },
          },
        },
      ],
      as: 'usuario_info',
    },
  },
  {
    $unwind: '$usuario_info',
  },
  {
    $lookup: {
      from: 'core.informacion-ejecutivo',
      localField: 'ejecutivo',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            _id: 0,
            nombre: 1,
          },
        },
      ],
      as: 'informacionEjecutivo_info',
    },
  },
  {
    $unwind: '$informacionEjecutivo_info',
  },
  {
    $lookup: {
      from: 'core.comentarios',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $sort: {
            fecha: -1,
          },
        },
        {
          $project: {
            _id: 0,
            actividades: 1,
          },
        },
      ],
      as: 'comentarios_info',
    },
  },
  {
    $unwind: '$comentarios_info',
  },
  {
    $lookup: {
      from: 'bitacora.actividades',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $sort: {
            fecha: -1,
          },
        },
        {
          $project: {
            _id: 0,
            actividad: 1,
            estatusBitacora: 1,
            fecha: 1,
          },
        },
      ],
      as: 'bitacoraActividades_info',
    },
  },
  {
    $lookup: {
      from: 'flow.contacto-telefonico',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $sort: {
            fechaProximaLlamada: 1,
          },
        },
        {
          $match: {
            tipoLlamada: 2,
          },
        },
        {
          $project: {
            _id: 0,
            tipoLlamada: 1,
            fechaProximaLlamada: 1,
            observaciones: 1,
            fechaContacto: 1,
          },
        },
      ],
      as: 'flowContactoTelefonico_info',
    },
  },
  {
    $lookup: {
      from: 'task.actividad-reminder',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $project: {
            _id: 0,
            actividad: 1,
            fechaEnvio: 1,
          },
        },
        {
          $sort: {
            fechaEnvio: -1,
          },
        },
      ],
      as: 'actividadReminder',
    },
  },
  {
    $lookup: {
      from: 'adm.configuracion-documental',
      let: {
        aseguradora_id: '$poliza_info.aseguradora',
        proyecto_id: '$proyecto',
        tipo_persona: '$titulare_info.tipoPersona',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$aseguradora', '$$aseguradora_id'],
                },
                {
                  $eq: ['$proyecto', '$$proyecto_id'],
                },
                {
                  $eq: ['$tipoPersona', '$$tipo_persona'],
                },
              ],
            },
          },
        },
        {
          $project: {
            _id: 0,
            documento: {
              $map: {
                input: {
                  $filter: {
                    input: '$documento',
                    as: 'doc',
                    cond: {
                      $eq: ['$$doc.activo', true],
                    },
                  },
                },
                as: 'documentos',
                in: {
                  documento: '$$documentos.documento',
                },
              },
            },
          },
        },
      ],
      as: 'configuracionDocumental_info',
    },
  },
  {
    $unwind: '$configuracionDocumental_info',
  },
  {
    $unwind: '$configuracionDocumental_info.documento',
  },
  {
    $lookup: {
      from: 'adm.documentos',
      localField: 'configuracionDocumental_info.documento.documento',
      foreignField: '_id',
      as: 'documentoCatalog_info',
    },
  },
  {
    $unwind: '$documentoCatalog_info',
  },
  {
    $project: {
      _id: 1,
      folioMultisistema: 1,
      fechaAlta: 1,
      titular: '$titulare_info',
      usuario: '$usuario_info',
      unidad: '$unidad_info',
      riesgo: '$riesgo_info',
      fechaVigencia: '$poliza_info.fechaVigencia',
      tipoMovimiento: '$tipoMovimiento',
      aseguradora: '$aseguradora_info',
      informacionEjecutivo: '$informacionEjecutivo_info',
      comentarios: '$comentarios_info',
      bitacora: '$bitacoraActividades_info',
      contactoTelefonico: '$flowContactoTelefonico_info',
      actividadReminder: '$actividadReminder',
      documentosRequeridos: {
        _id: '$documentoCatalog_info._id',
        nombre: '$documentoCatalog_info.nombre',
        estatus: '$documentoCatalog_info.estatus',
        categoria: '$documentoCatalog_info.categoria',
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      folioMultisistema: {
        $first: '$folioMultisistema',
      },
      fechaAlta: {
        $first: '$fechaAlta',
      },
      titular: {
        $first: '$titular',
      },
      usuario: {
        $first: '$usuario',
      },
      unidad: {
        $first: '$unidad',
      },
      riesgo: {
        $first: '$riesgo',
      },
      fechaVigencia: {
        $first: '$fechaVigencia',
      },
      tipoMovimiento: {
        $first: '$tipoMovimiento',
      },
      aseguradora: {
        $first: '$aseguradora',
      },
      informacionEjecutivo: {
        $first: '$informacionEjecutivo',
      },
      comentarios: {
        $first: '$comentarios',
      },
      bitacora: {
        $first: '$bitacora',
      },
      contactoTelefonico: {
        $first: '$contactoTelefonico',
      },
      actividadReminder: {
        $first: '$actividadReminder',
      },
      root: {
        $push: '$$ROOT',
      },
    },
  },
  {
    $project: {
      _id: 1,
      folioMultisistema: 1,
      fechaAlta: 1,
      titular: 1,
      usuario: 1,
      unidad: 1,
      riesgo: 1,
      fechaVigencia: 1,
      tipoMovimiento: 1,
      aseguradora: 1,
      informacionEjecutivo: 1,
      comentarios: 1,
      bitacora: 1,
      contactoTelefonico: 1,
      actividadReminder: 1,
      documentosRequeridos: {
        $map: {
          input: '$root',
          as: 'doc',
          in: {
            _id: '$$doc.documentosRequeridos._id',
            nombre: '$$doc.documentosRequeridos.nombre',
            estatus: '$$doc.documentosRequeridos.estatus',
            categoria: '$$doc.documentosRequeridos.categoria',
          },
        },
      },
    },
  },
  {
    $lookup: {
      from: 'expediente.archivos',
      let: {
        aseguradora_id: '$aseguradora._id',
        titular_id: '$titular._id',
      },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                {
                  $eq: ['$aseguradora', '$$aseguradora_id'],
                },
                {
                  $eq: ['$titular', '$$titular_id'],
                },
              ],
            },
            eliminado: false,
          },
        },
        {
          $project: {
            _id: 0,
            documento: 1,
          },
        },
      ],
      as: 'documentosSubidos',
    },
  },

  {
    $project: {
      _id: 1,
      folioMultisistema: 1,
      fechaAlta: 1,
      titular: 1,
      usuario: 1,
      unidad: 1,
      riesgo: 1,
      fechaVigencia: 1,
      tipoMovimiento: 1,
      aseguradora: 1,
      informacionEjecutivo: 1,
      comentarios: 1,
      bitacora: 1,
      contactoTelefonico: 1,
      actividadReminder: 1,
      documentosRequeridos: 1,
      documentosSubidos: '$documentosSubidos',
    },
  },
  {
    $lookup: {
      from: 'workflow.actividades',
      localField: 'folioMultisistema',
      foreignField: 'folioMultisistema',
      pipeline: [
        {
          $project: {
            _id: 1,
            actividad: 1,
            estatus: 1,
            fechaInicial: 1,
            fechaAlta: 1,
            fechaFinal: 1,
          },
        },
      ],
      as: 'workflowActividades_info',
    },
  },
  {
    $unwind: '$workflowActividades_info',
  },
  {
    $sort: {
      'workflowActividades_info.fechaAlta': -1,
    },
  },
  {
    $lookup: {
      from: 'cat.actividades',
      localField: 'workflowActividades_info.actividad',
      foreignField: 'clave',
      pipeline: [
        {
          $project: {
            _id: 0,
            descripcion: 1,
            clave: 1,
          },
        },
      ],
      as: 'actividad_info',
    },
  },
  {
    $unwind: '$actividad_info',
  },
  {
    $lookup: {
      from: 'cat.estatus-actividades',
      localField: 'workflowActividades_info.estatus',
      foreignField: 'clave',
      pipeline: [
        {
          $project: {
            _id: 0,
            descripcion: 1,
            clave: 1,
          },
        },
      ],
      as: 'estatusActividad',
    },
  },
  {
    $unwind: '$estatusActividad',
  },
  {
    $project: {
      _id: 1,
      folioMultisistema: 1,
      fechaAlta: 1,
      titular: 1,
      usuario: 1,
      unidad: 1,
      riesgo: 1,
      fechaVigencia: 1,
      tipoMovimiento: 1,
      aseguradora: 1,
      informacionEjecutivo: 1,
      comentarios: 1,
      bitacora: 1,
      contactoTelefonico: 1,
      actividadReminder: 1,
      documentosRequeridos: 1,
      documentosSubidos: 1,
      workflow: {
        actividad: '$actividad_info',
        estatusActividad: '$estatusActividad',
        _id: '$workflowActividades_info._id',
        fechaInicial: '$workflowActividades_info.fechaInicial',
        fechaAlta: '$workflowActividades_info.fechaAlta',
        fechaFinal: '$workflowActividades_info.fechaFinal',
      },
    },
  },
  {
    $group: {
      _id: '$_id',
      folioMultisistema: {
        $first: '$folioMultisistema',
      },
      fechaAlta: {
        $first: '$fechaAlta',
      },
      titular: {
        $first: '$titular',
      },
      usuario: {
        $first: '$usuario',
      },
      unidad: {
        $first: '$unidad',
      },
      riesgo: {
        $first: '$riesgo',
      },
      fechaVigencia: {
        $first: '$fechaVigencia',
      },
      tipoMovimiento: {
        $first: '$tipoMovimiento',
      },
      aseguradora: {
        $first: '$aseguradora',
      },
      informacionEjecutivo: {
        $first: '$informacionEjecutivo',
      },
      comentarios: {
        $first: '$comentarios',
      },
      bitacora: {
        $first: '$bitacora',
      },
      contactoTelefonico: {
        $first: '$contactoTelefonico',
      },
      actividadReminder: {
        $first: '$actividadReminder',
      },
      documentosRequeridos: {
        $first: '$documentosRequeridos',
      },
      documentosSubidos: {
        $first: '$documentosSubidos',
      },
      document: {
        $push: '$$ROOT',
      },
    },
  },
  {
    $project: {
      _id: 1,
      folioMultisistema: 1,
      fechaAlta: 1,
      titular: 1,
      usuario: 1,
      unidad: 1,
      riesgo: 1,
      fechaVigencia: 1,
      tipoMovimiento: 1,
      aseguradora: 1,
      informacionEjecutivo: 1,
      comentarios: 1,
      bitacora: 1,
      contactoTelefonico: 1,
      actividadReminder: 1,
      documentosRequeridos: 1,
      documentosSubidos: 1,
      workflowActividades: {
        $map: {
          input: '$document',
          as: 'doc',
          in: {
            _id: '$$doc.workflow._id',
            actividad: '$$doc.workflow.actividad',
            estatusActividad: '$$doc.workflow.estatusActividad',
            fechaInicial: '$$doc.workflow.fechaInicial',
            fechaAlta: '$$doc.workflow.fechaAlta',
            fechaFinal: '$$doc.workflow.fechaFinal',
          },
        },
      },
    },
  },
  {
    $lookup: {
      from: 'flow.validacion-documental',
      localField: '_id',
      foreignField: 'folio',
      pipeline: [
        {
          $project: {
            _id: 0,
            archivos: 1,
          },
        },
      ],

      as: 'documentosCorrectos',
    },
  },
  // {
  //   $unwind: '$documentosCorrectos',
  // },
  {
    $sort: {
      folioMultisistema: 1,
    },
  },
];
export default REPORTE_SEGUIMIENTO;
