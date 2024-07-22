export const NotificationConsts = {
  ADMINISTRACION: {
    USER: {
      activarCuenta: 'authentication/activar-cuenta',
      recuperarContrasena: 'authentication/recover-password',
    },
  },
  AUTH: {
    SESIONES: {
      codigoMFA: 'authentication/codigo-autentificacion',
    },
  },
  CORE: {
    FOLIO: {
      cargaMasiva: 'fianzas-core/estatus-carga-masiva',
    },
    SOLICITUD: {
      solicitud: 'fianzas-core/solicitud',
    },
    VALIDACION_DOCUMENTAL: {
      revisionDocumental: 'fianzas-core/revision-documental',
      revisionDocumental_portal: 'fianzas-portal/revision-documental',
      generacionDeFormatos:'fianzas-core/generacion-de-formatos'
    },
    FIRMA_DOCUMENTAL: {
      solicitudFirmaEjecutivo: 'fianzas-core/solicitud-firma-ejecutivo',
      solicitudFirmaEjecutivo_Portal: 'fianzas-portal/solicitud-firma-ejecutivo',
    },
    VALIDACION_FIRMAS: {
      solicitudFirmaAsegurado: 'fianzas-core/solicitud-firma-asegurado',
      formatosFirmados: 'fianzas-core/formatos-firmados',
      revisionFormatos: 'fianzas-core/revision-de-formatos'

    },
    GENERACION_FORMATOS: {
      firmaDocumentos: 'fianzas-core/firma-de-documentos',
    },
    CONTACTO_TELEFONICO: {
      datosContacto: 'fianzas-core/datos-contacto',
      noContinuaProceso: 'fianzas-core/no-continua-proceso',
    },
    CONFIRMACION_ENTREGA: {
      formatosFimados: 'fianzas-core/formatos-firmados',
      formatoEntregado: 'fianzas-core/confirmacion-entrega',
    },
    PORTAL: {
      recepcion_documentos: 'fianzas-portal/recepcion-documentos',
      firmaDocumentos: 'fianzas-portal/firma-de-documentos',
    },
    TASK: {
      taskLayoutSalida: 'fianzas-jobs/job-layout-salida',
    },
    CONTACTO_ASEGURADORA: {
      recepcion_documentos: 'fianzas-core/recepcion-de-documentos',
      recepcion_documentos_portal: 'fianzas-portal/recepcion-de-documentos'
    },
    VALIDACION_AFIANZADORA: {
      recoleccion_fisicos: 'fianzas-core/recoleccion-fisicos'
    },
    RECOLECCION_FISICOS: {
      fisicos_enviados: 'fianzas-core/fisicos-enviados',
      fisicos_enviados_portal: 'fianzas-portal/fisicos-enviados'
    },
    VALIDACION_ORIGINALES: {
      revision_documentacion_fisica: 'fianzas-core/revision-documentacion-fisica'
    }
  },
};
