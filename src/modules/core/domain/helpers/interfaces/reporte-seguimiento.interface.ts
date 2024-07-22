export interface ReporteSeguimientoType {
  _id: string;
  folioMultisistema: number;
  fechaAlta: string;
  titular: ReporteSeguimientoTypeTitular;
  usuario: ReporteSeguimientoTypeUsuario;
  unidad: ReporteSeguimientoTypeUnidad;
  riesgo: ReporteSeguimientoTypeRiesgo;
  fechaVigencia: string;
  tipoMovimiento: ReporteSeguimientoTypeTipoMovimiento;
  aseguradora: ReporteSeguimientoTypeAseguradora;
  informacionEjecutivo: ReporteSeguimientoTypeInformacionEjecutivo;
  comentarios: ReporteSeguimientoTypeComentarios;
  bitacora: ReporteSeguimientoTypeBitacora[];
  contactoTelefonico: ContactoTelefonicoType[];
  workflowActividades: ReporteSeguimientoTypeWorkflowActividades[];
  actividadReminder: TaskActividadReminderType[];
  documentosRequeridos: DocumentoRequeridoType[];
  documentosSubidos: DocumentoSubidoType[];
  documentosCorrectos: DocumentosCorrectosType[];
}

export interface DocumentosCorrectosType {
  archivos: Archivo[];
}

export interface Archivo {
  correcto: boolean;
  documento: string;
  expediente: string;
  motivo: number;
  fechaVigencia: Date;
}

export interface ContactoTelefonicoType {
  tipoLlamada: number;
  fechaProximaLlamada: string;
  observaciones: string;
}

export interface ReporteSeguimientoTypeTitular {
  numeroCliente: string;
  nombre: string;
}

export interface ReporteSeguimientoTypeUsuario {
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  nombreCompleto: string;
}

export interface ReporteSeguimientoTypeUnidad {
  clave: number;
  descripcion: string;
}

export interface ReporteSeguimientoTypeRiesgo {
  clave: number;
  descripcion: string;
}

export interface ReporteSeguimientoTypeTipoMovimiento {
  clave: number;
  descripcion: string;
}

export interface ReporteSeguimientoTypeAseguradora {
  nombreComercial: string;
}

export interface ReporteSeguimientoTypeInformacionEjecutivo {
  nombre: string;
}

export interface ReporteSeguimientoTypeComentariosActividades {
  bitacora: string;
  comentarios: string;
  actividad: number;
  fecha: string;
}

export interface ReporteSeguimientoTypeComentarios {
  actividades: ReporteSeguimientoTypeComentariosActividades[];
}

export interface ReporteSeguimientoTypeBitacora {
  actividad: number;
  estatusBitacora: string;
  fecha: Date;
}

export interface ReporteSeguimientoTypeWorkflowActividadesActividad {
  clave: number;
  descripcion: string;
}

export interface ReporteSeguimientoTypeWorkflowActividadesEstatusActividad {
  clave: number;
  descripcion: string;
}

export interface ReporteSeguimientoTypeWorkflowActividades {
  _id: string;
  actividad: ReporteSeguimientoTypeWorkflowActividadesActividad;
  estatusActividad: ReporteSeguimientoTypeWorkflowActividadesEstatusActividad;
  fechaInicial: string;
  fechaAlta: string;
  fechaFinal: string;
}

export interface TaskActividadReminderType {
  _id: string;
  folio: string;
  actividad: number;
  fechaEnvio: string;
}

export interface DocumentoRequeridoType {
  _id: string;
  nombre: string;
  estatus: number;
  categoria: number;
}

export interface DocumentoSubidoType {
  documento: string;
}

