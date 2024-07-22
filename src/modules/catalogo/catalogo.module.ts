import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CatSharedService } from './domain/services/_cat.shared.service';
import { CatActividadService } from './domain/services/cat.actividad.service';
import { CatCategoriaDocumentoService } from './domain/services/cat.categoria-documento.service';
import { CatEstatusActividadService } from './domain/services/cat.estatus-actividad.service';
import { CatEstatusContactoTelefonicoService } from './domain/services/cat.estatus-contacto-telefonico.service';
import { CatEstatusGeneracionFormatosService } from './domain/services/cat.estatus-generacion-formatos.service';
import { CatEstatusGeneralService } from './domain/services/cat.estatus-general.service';
import { CatEstatusUsuarioService } from './domain/services/cat.estatus-usuario.service';
import { CatGiroService } from './domain/services/cat.giro.service';
import { CatMotivoRechazoService } from './domain/services/cat.motivo-rechazo.service';
import { CatNegocioService } from './domain/services/cat.negocio.service';
import { CatOficinaService } from './domain/services/cat.oficina.service';
import { CatPaisService } from './domain/services/cat.pais.service';
import { CatPerfilService } from './domain/services/cat.perfil.service';
import { CatProcesoService } from './domain/services/cat.proceso.service';
import { CatRamoService } from './domain/services/cat.ramo.service';
import { CatRiesgoService } from './domain/services/cat.riesgo.service';
import { CatTipoCargaService } from './domain/services/cat.tipo-carga.service';
import { CatTipoContactoService } from './domain/services/cat.tipo-contacto.service';
import { CatTipoLlamadaService } from './domain/services/cat.tipo-llamada.service';
import { CatTipoMovimientoService } from './domain/services/cat.tipo-movimiento.service';
import { CatTipoPersonaService } from './domain/services/cat.tipo-persona.service';
import { CatUnidadService } from './domain/services/cat.unidad.service';

import {
  CatActividad,
  CatActividadSchema,
} from './persistence/database/cat.actividad.schema';
import {
  CatCategoriaDocumento,
  CatCategoriaDocumentoSchema,
} from './persistence/database/cat.categoria-documento.schema';
import {
  CatEstatusActividad,
  CatEstatusActividadSchema,
} from './persistence/database/cat.estatus-actividad.schema';
import {
  CatTipoCarga,
  CatTipoCargaSchema,
} from './persistence/database/cat.tipo-carga.schema';
import {
  CatTipoMovimiento,
  CatTipoMovimientoSchema,
} from './persistence/database/cat.tipo-movimiento.schema';

import {
  CatEstatusContactoTelefonico,
  CatEstatusContactoTelefonicoSchema,
} from './persistence/database/cat.estatus-contacto-telefonico.schema';
import {
  CatEstatusGeneracionFormato,
  CatEstatusGeneracionFormatoSchema,
} from './persistence/database/cat.estatus-generacion-formato.schema';
import {
  CatEstatusGeneral,
  CatEstatusGeneralSchema,
} from './persistence/database/cat.estatus-general.schema';
import {
  CatEstatusUsuario,
  CatEstatusUsuarioSchema,
} from './persistence/database/cat.estatus-usuario.schema';
import { CatGiro, CatGiroSchema } from './persistence/database/cat.giro.schema';
import {
  CatMotivoRechazo,
  CatMotivoRechazoSchema,
} from './persistence/database/cat.motivo-rechazo.schema';
import {
  CatNegocio,
  CatNegocioSchema,
} from './persistence/database/cat.negocio.schema';
import {
  CatOficina,
  CatOficinaSchema,
} from './persistence/database/cat.oficina.schema';
import { CatPais, CatPaisSchema } from './persistence/database/cat.pais.schema';
import {
  CatPerfil,
  CatPerfilSchema,
} from './persistence/database/cat.perfil.schema';
import {
  CatProceso,
  CatProcesoSchema,
} from './persistence/database/cat.proceso.schema';
import { CatRamo, CatRamoSchema } from './persistence/database/cat.ramo.schema';
import {
  CatRiesgo,
  CatRiesgoSchema,
} from './persistence/database/cat.riesgo.schema';
import {
  CatTipoContacto,
  CatTipoContactoSchema,
} from './persistence/database/cat.tipo-contacto.schema';
import {
  CatTipoLlamada,
  CatTipoLlamadaSchema,
} from './persistence/database/cat.tipo-llamada.schema';
import {
  CatTipoPersona,
  CatTipoPersonaSchema,
} from './persistence/database/cat.tipo-persona.schema';
import {
  CatUnidad,
  CatUnidadSchema,
} from './persistence/database/cat.unidad.schema';

import { CatActividadRepository } from './persistence/repository/cat.actividad.repository';
import { CatCategoriaDocumentoRepository } from './persistence/repository/cat.categoria-documento.repository';
import { CatEstatusActividadRepository } from './persistence/repository/cat.estatus-actividad.repository';
import { CatEstatusContactoTelefonicoRepository } from './persistence/repository/cat.estatus-contacto-telefonico.repository';
import { CatEstatusGeneracionFormatosRepository } from './persistence/repository/cat.estatus-generacion-formatos.repository';
import { CatEstatusGeneralRepository } from './persistence/repository/cat.estatus-general.repository';
import { CatEstatusUsuarioRepository } from './persistence/repository/cat.estatus-usuario.repository';
import { CatGiroRepository } from './persistence/repository/cat.giro.repository';
import { CatMotivoRechazoRepository } from './persistence/repository/cat.motivo-rechazo.repository';
import { CatNegocioRepository } from './persistence/repository/cat.negocio.repository';
import { CatOficinaRepository } from './persistence/repository/cat.oficina.repository';
import { CatPaisRepository } from './persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from './persistence/repository/cat.perfil.repository';
import { CatProcesoRepository } from './persistence/repository/cat.proceso.repository';
import { CatRamoRepository } from './persistence/repository/cat.ramo.repository';
import { CatRiesgoRepository } from './persistence/repository/cat.riesgo.repository';
import { CatTipoCargaRepository } from './persistence/repository/cat.tipo-carga.repository';
import { CatTipoContactoRepository } from './persistence/repository/cat.tipo-contacto.repository';
import { CatTipoLlamadaRepository } from './persistence/repository/cat.tipo-llamada.repository';
import { CatTipoMovimientoRepository } from './persistence/repository/cat.tipo-movimiento.repository';
import { CatTipoPersonaRepository } from './persistence/repository/cat.tipo-persona.repository';
import { CatUnidadRepository } from './persistence/repository/cat.unidad.repository';
import {CatReporte, CatReporteSchema} from "./persistence/database/cat.reporte.schema";
import {CatReporteRepository} from "./persistence/repository/cat.reporte.repository";
import {CatReporteService} from "./domain/services/cat.reporte.service";
import { CatDiaFestivo, CatDiaFestivoSchema } from './persistence/database/cat.dia-festivo.schema';
import { CatDiaFestivoRepository } from './persistence/repository/cat.dia-festivo.repository';
import { CatDiaFestivoService } from './domain/services/cat.dia-festivo.service';

const models = {
  administracion: [],
  catalogo: [
    { name: CatActividad.name, useFactory: () => CatActividadSchema },
    {
      name: CatCategoriaDocumento.name,
      useFactory: () => CatCategoriaDocumentoSchema,
    },
    {
      name: CatEstatusActividad.name,
      useFactory: () => CatEstatusActividadSchema,
    },
    {
      name: CatEstatusContactoTelefonico.name,
      useFactory: () => CatEstatusContactoTelefonicoSchema,
    },
    {
      name: CatEstatusGeneracionFormato.name,
      useFactory: () => CatEstatusGeneracionFormatoSchema,
    },
    {
      name: CatEstatusGeneral.name,
      useFactory: () => CatEstatusGeneralSchema,
    },
    {
      name: CatEstatusUsuario.name,
      useFactory: () => CatEstatusUsuarioSchema,
    },
    { name: CatGiro.name, useFactory: () => CatGiroSchema },
    { name: CatMotivoRechazo.name, useFactory: () => CatMotivoRechazoSchema },
    { name: CatNegocio.name, useFactory: () => CatNegocioSchema },
    { name: CatOficina.name, useFactory: () => CatOficinaSchema },
    { name: CatPais.name, useFactory: () => CatPaisSchema },
    { name: CatPerfil.name, useFactory: () => CatPerfilSchema },
    { name: CatProceso.name, useFactory: () => CatProcesoSchema },
    { name: CatRamo.name, useFactory: () => CatRamoSchema },
    { name: CatRiesgo.name, useFactory: () => CatRiesgoSchema },
    { name: CatTipoCarga.name, useFactory: () => CatTipoCargaSchema },
    { name: CatTipoContacto.name, useFactory: () => CatTipoContactoSchema },
    { name: CatTipoLlamada.name, useFactory: () => CatTipoLlamadaSchema },
    {
      name: CatTipoMovimiento.name,
      useFactory: () => CatTipoMovimientoSchema,
    },
    { name: CatTipoPersona.name, useFactory: () => CatTipoPersonaSchema },
    { name: CatUnidad.name, useFactory: () => CatUnidadSchema },
    { name: CatReporte.name, useFactory: () => CatReporteSchema },
    { name: CatDiaFestivo.name, useFactory: () => CatDiaFestivoSchema },

  ],
};

const Repositories = [
  CatActividadRepository,
  CatCategoriaDocumentoRepository,
  CatEstatusActividadRepository,
  CatEstatusContactoTelefonicoRepository,
  CatEstatusGeneracionFormatosRepository,
  CatEstatusGeneralRepository,
  CatEstatusUsuarioRepository,
  CatGiroRepository,
  CatMotivoRechazoRepository,
  CatNegocioRepository,
  CatOficinaRepository,
  CatPaisRepository,
  CatPerfilRepository,
  CatProcesoRepository,
  CatRamoRepository,
  CatRiesgoRepository,
  CatTipoCargaRepository,
  CatTipoContactoRepository,
  CatTipoLlamadaRepository,
  CatTipoMovimientoRepository,
  CatTipoPersonaRepository,
  CatUnidadRepository,
  CatReporteRepository,
  CatDiaFestivoRepository,

];

const Services = [
  CatSharedService,
  CatActividadService,
  CatCategoriaDocumentoService,
  CatEstatusActividadService,
  CatEstatusContactoTelefonicoService,
  CatEstatusGeneracionFormatosService,
  CatEstatusGeneralService,
  CatEstatusUsuarioService,
  CatGiroService,
  CatMotivoRechazoService,
  CatNegocioService,
  CatOficinaService,
  CatPaisService,
  CatPerfilService,
  CatProcesoService,
  CatRamoService,
  CatRiesgoService,
  CatTipoCargaService,
  CatTipoContactoService,
  CatTipoLlamadaService,
  CatTipoMovimientoService,
  CatTipoPersonaService,
  CatUnidadService,
  CatReporteService,
  CatDiaFestivoService,
];

@Module({
  imports: [MongooseModule.forFeatureAsync([...models.catalogo])],
  providers: [...Repositories, ...Services],
  exports: [...Services],
})
export class CatalogoModule {}
