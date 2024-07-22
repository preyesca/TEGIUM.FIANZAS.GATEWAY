export interface FolioReportType {
  _id: string;
  folioMultisistema: number;
  folioCliente: string;
  proyecto: FolioReportTypeProyecto;
  titular: Titular;
  ejecutivo: Ejecutivo;
  tipoCarga: CatalogType;
  usuario: Usuario;
  tipoMovimiento: CatalogType;
  giro: CatalogType;
  pais: string;
  fechaAlta: string;
  poliza: Poliza;
  comentario: ComentarioType;
  configuracionDocumental?: ConfiguracionDocumentalType;
  workflow: WorkflowType[];
  expediente: any[];
  flowContactoTelefonico: ContactoTelefonicoType[];
  taskActividadReminder: TaskActividadReminderType[];
  flowValidacionDocumental?: FlowValidacionDocumentalType;
}

export interface FlowValidacionDocumentalType {
  _id: string;
  folio: string;
  archivoFic: string;
  archivoAnexo: null;
  archivos: Archivo[];
  apoderado: string;
  pais: number;
  tipoPersona: number;
}

export interface Archivo {
  correcto: boolean;
  documento: string;
  expediente: string;
  motivo: number | null;
  fechaVigencia?: Date;
}

export interface TaskActividadReminderType {
  _id: string;
  folio: string;
  actividad: Actividad;
  fechaEnvio: string;
}

export interface ContactoTelefonicoType {
  _id: string;
  tipoLlamada: CatalogType;
  estatus: CatalogType;
  fechaProximaLlamada: string;
  observaciones: string;
  usuario: string;
  folio: string;
  fechaContacto: string;
}

export interface ConfiguracionDocumentalType {
  _id: string;
  pais: number;
  aseguradora: string;
  proyecto: string;
  tipoPersona: TipoPersona;
  giro: number;
  estatus: number;
  documento: DocumentoElement[];
}

export interface DocumentoElement {
  documento: DocumentoDocumento;
  activo: boolean;
  obligatorio: boolean;
  ocr: boolean;
  vigencia: boolean;
  motivosRechazo: number[];
}

export interface DocumentoDocumento {
  _id: string;
  pais: number;
  categoria: number;
  estatus: number;
  nombre: string;
  nombreBase: string;
  clave: string;
  activo: boolean;
  lang: Lang;
}

export interface TipoPersona {
  _id: string;
  clave: number;
  descripcion: string;
  pais: number;
  activo: boolean;
}

export interface ComentarioType {
  _id: string;
  folio: string;
  actividades: ComentarioActividadType[];
}

export interface ComentarioActividadType {
  comentarios: string;
  bitacora: BitacoraType;
  actividad: Actividad;
  fecha: string;
}

export interface BitacoraType {
  _id: string;
  folio: string;
  actividad: number;
  usuario: string;
  estatusBitacora: string;
  fecha: Date;
}

export interface WorkflowType {
  _id: string;
  proyecto: string;
  folioMultisistema: number;
  actividad: Actividad;
  estatus: Actividad;
  usuario: string;
  rol: number;
  fechaAlta: string;
  fechaInicial: string;
  fechaFinal: string;
}

export interface Actividad {
  _id: string;
  clave: number;
  descripcion: string;
  activo: boolean;
  lang?: Lang;
}

export interface Aseguradora {
  _id: string;
  razonSocial: string;
  nombreComercial: string;
  pais: number;
  estatus: number;
  oficinas: any[];
  altaProyecto: boolean;
  documentos: boolean;
}

export interface Ejecutivo {
  _id: string;
  proyecto: string;
  numero: string;
  nombre: string;
}

export interface CatalogType {
  _id: string;
  clave: number;
  descripcion: string;
  activo: boolean;
  lang?: Lang;
}

export interface Lang {
  en: En;
}

export interface En {
  nombre: string;
}

export interface Poliza {
  _id: string;
  folio: string;
  aseguradora: Aseguradora;
  riesgo: CatalogType;
  unidad: CatalogType;
  fechaVigencia: string;
}

export interface FolioReportTypeProyecto {
  _id: string;
  pais: number;
  ramo: number;
  proceso: number;
  negocio: number;
  ceco: string;
  estatus: number;
  aseguradora: string;
  codigo: string;
  portal: string;
}

export interface Titular {
  _id: string;
  proyecto: string;
  numeroCliente: string;
  nombre: string;
  tipoPersona: number;
}

export interface Usuario {
  _id: string;
  nombre: string;
  primerApellido: string;
  segundoApellido: string;
  correoElectronico: string;
  proyectos: ProyectoElement[];
}

export interface ProyectoElement {
  proyecto: string;
  pais: number;
  perfiles: number[];
}
