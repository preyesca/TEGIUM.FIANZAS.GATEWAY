import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServicesModule } from 'src/app/services/services.module';
import { CatEstatusContactoTelefonicoRepository } from '../catalogo/persistence/repository/cat.estatus-contacto-telefonico.repository';
import { AdmConfiguracionDocumentalService } from '../administracion/domain/services/adm.configuracion-documental.service';
import { AdmDocumentoService } from '../administracion/domain/services/adm.documento.service';
import { AdmAseguradora, AdmAseguradoraSchema } from '../administracion/persistence/database/adm.aseguradora.schema';
import { AdmConfiguracionDocumental, AdmConfiguracionDocumentalSchema } from '../administracion/persistence/database/adm.configuracion-documental.schema';
import { AdmDocumento, AdmDocumentoSchema } from '../administracion/persistence/database/adm.documento.schema';
import { AdmProyecto, AdmProyectoSchema } from '../administracion/persistence/database/adm.proyecto.schema';
import { AdmAseguradoraRepository } from '../administracion/persistence/repository/adm.aseguradora.repository';
import { AdmConfiguracionDocumentalRepository } from '../administracion/persistence/repository/adm.configuracion-documental.repository';
import { AdmDocumentoRepository } from '../administracion/persistence/repository/adm.documento.repository';
import { AdmProyectoRepository } from '../administracion/persistence/repository/adm.proyecto.repository';
import { CatSharedService } from '../catalogo/domain/services/_cat.shared.service';
import { CatCategoriaDocumento, CatCategoriaDocumentoSchema } from '../catalogo/persistence/database/cat.categoria-documento.schema';
import { CatEstatusContactoTelefonico, CatEstatusContactoTelefonicoSchema } from '../catalogo/persistence/database/cat.estatus-contacto-telefonico.schema';
import { CatEstatusGeneral, CatEstatusGeneralSchema } from '../catalogo/persistence/database/cat.estatus-general.schema';
import { CatEstatusUsuario, CatEstatusUsuarioSchema } from '../catalogo/persistence/database/cat.estatus-usuario.schema';
import { CatGiro, CatGiroSchema } from '../catalogo/persistence/database/cat.giro.schema';
import { CatMotivoRechazo, CatMotivoRechazoSchema } from '../catalogo/persistence/database/cat.motivo-rechazo.schema';
import { CatNegocio, CatNegocioSchema } from '../catalogo/persistence/database/cat.negocio.schema';
import { CatOficina, CatOficinaSchema } from '../catalogo/persistence/database/cat.oficina.schema';
import { CatPais, CatPaisSchema } from '../catalogo/persistence/database/cat.pais.schema';
import { CatPerfil, CatPerfilSchema } from '../catalogo/persistence/database/cat.perfil.schema';
import { CatProceso, CatProcesoSchema } from '../catalogo/persistence/database/cat.proceso.schema';
import { CatRamo, CatRamoSchema } from '../catalogo/persistence/database/cat.ramo.schema';
import { CatTipoContacto, CatTipoContactoSchema } from '../catalogo/persistence/database/cat.tipo-contacto.schema';
import { CatTipoLlamada, CatTipoLlamadaSchema } from '../catalogo/persistence/database/cat.tipo-llamada.schema';
import { CatTipoPersona, CatTipoPersonaSchema } from '../catalogo/persistence/database/cat.tipo-persona.schema';
import { CatCategoriaDocumentoRepository } from '../catalogo/persistence/repository/cat.categoria-documento.repository';
import { CatEstatusGeneralRepository } from '../catalogo/persistence/repository/cat.estatus-general.repository';
import { CatEstatusUsuarioRepository } from '../catalogo/persistence/repository/cat.estatus-usuario.repository';
import { CatGiroRepository } from '../catalogo/persistence/repository/cat.giro.repository';
import { CatMotivoRechazoRepository } from '../catalogo/persistence/repository/cat.motivo-rechazo.repository';
import { CatNegocioRepository } from '../catalogo/persistence/repository/cat.negocio.repository';
import { CatOficinaRepository } from '../catalogo/persistence/repository/cat.oficina.repository';
import { CatPaisRepository } from '../catalogo/persistence/repository/cat.pais.repository';
import { CatPerfilRepository } from '../catalogo/persistence/repository/cat.perfil.repository';
import { CatProcesoRepository } from '../catalogo/persistence/repository/cat.proceso.repository';
import { CatRamoRepository } from '../catalogo/persistence/repository/cat.ramo.repository';
import { CatTipoContactoRepository } from '../catalogo/persistence/repository/cat.tipo-contacto.repository';
import { CatTipoLlamadaRepository } from '../catalogo/persistence/repository/cat.tipo-llamada.repository';
import { CatTipoPersonaRepository } from '../catalogo/persistence/repository/cat.tipo-persona.repository';
import { CoreTitular, CoreTitularSchema } from '../core/persistence/database/core.titular.schema';
import { CoreTitularRepository } from '../core/persistence/repository/core.titular.repository';
import { ExpArchivo, ExpArchivoSchema } from './persistence/database/exp.archivo.schema';
import { ExpArchivoRepository } from './persistence/repository/exp.archivo.repository';
import { ExpArchivoService } from './domain/services/exp.archivo.service';


const models = {
  administracion: [
    { name: AdmAseguradora.name, useFactory: () => AdmAseguradoraSchema },
    {
      name: AdmConfiguracionDocumental.name,
      useFactory: () => AdmConfiguracionDocumentalSchema,
    },
    { name: AdmDocumento.name, useFactory: () => AdmDocumentoSchema },
    { name: AdmProyecto.name, useFactory: () => AdmProyectoSchema },
  ],
  catalogo: [
    {
      name: CatCategoriaDocumento.name,
      useFactory: () => CatCategoriaDocumentoSchema,
    },
    {
      name: CatEstatusContactoTelefonico.name,
      useFactory: () => CatEstatusContactoTelefonicoSchema,
    },
    {
      name: CatEstatusGeneral.name,
      useFactory: () => CatEstatusGeneralSchema,
    },
    { name: CatEstatusUsuario.name, useFactory: () => CatEstatusUsuarioSchema },
    { name: CatGiro.name, useFactory: () => CatGiroSchema },
    { name: CatMotivoRechazo.name, useFactory: () => CatMotivoRechazoSchema },
    { name: CatNegocio.name, useFactory: () => CatNegocioSchema },
    { name: CatOficina.name, useFactory: () => CatOficinaSchema },
    { name: CatPais.name, useFactory: () => CatPaisSchema },
    { name: CatPerfil.name, useFactory: () => CatPerfilSchema },
    { name: CatProceso.name, useFactory: () => CatProcesoSchema },
    { name: CatRamo.name, useFactory: () => CatRamoSchema },
    { name: CatTipoContacto.name, useFactory: () => CatTipoContactoSchema },
    { name: CatTipoLlamada.name, useFactory: () => CatTipoLlamadaSchema },
    { name: CatTipoPersona.name, useFactory: () => CatTipoPersonaSchema },
  ],
  core: [{ name: CoreTitular.name, useFactory: () => CoreTitularSchema }],
  expediente: [{ name: ExpArchivo.name, useFactory: () => ExpArchivoSchema }],
};

const Repositories = [
  AdmAseguradoraRepository,
  AdmDocumentoRepository,
  AdmConfiguracionDocumentalRepository,
  AdmProyectoRepository,
  CatCategoriaDocumentoRepository,
  CatEstatusContactoTelefonicoRepository,
  CatEstatusGeneralRepository,
  CatEstatusUsuarioRepository,
  CatGiroRepository,
  CatMotivoRechazoRepository,
  CatNegocioRepository,
  CatOficinaRepository,
  CatPaisRepository,
  CatProcesoRepository,
  CatPerfilRepository,
  CatRamoRepository,
  CatTipoContactoRepository,
  CatTipoLlamadaRepository,
  CatTipoPersonaRepository,
  CoreTitularRepository,
  ExpArchivoRepository,
];

const Services = [
  AdmConfiguracionDocumentalService,
  AdmDocumentoService,
  CatSharedService,
  ExpArchivoService,
];

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      ...models.administracion,
      ...models.catalogo,
      ...models.core,
      ...models.expediente,
    ]),
  ],
  providers: [...Repositories, ...Services],
  exports: [ExpArchivoService],
})
export class ExpedienteModule {}
