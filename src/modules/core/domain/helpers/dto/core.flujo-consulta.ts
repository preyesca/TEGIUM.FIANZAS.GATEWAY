export interface CoreFlujoConsulta {
  folio: string;
  folioMultisistema: number;
  actividadActual: number;
  actividadActualEstatus: number;
  ultimaActividadActual: number;
  ultimaActividadEstatus: number;
  actividadContactoTelefonico: number | undefined;
  actividadContactoTelefonicoEstatus: number | undefined;
  actividadContactoAseguradora: number | undefined;
  actividadContactoAseguradoraEstatus: number | undefined;
}
