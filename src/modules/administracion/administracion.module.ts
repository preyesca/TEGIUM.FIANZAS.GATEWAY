import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServicesModule } from 'src/app/services/services.module';
import { AdmAseguradoraService } from './domain/services/adm.aseguradora.service';
import { AdmConfiguracionAseguradoraService } from './domain/services/adm.configuracion-aseguradora.service';
import { AdmConfiguracionDocumentalService } from './domain/services/adm.configuracion-documental.service';
import { AdmConfiguracionFirmaCotejoService } from './domain/services/adm.configuracion-firma-cotejo.service';
import { AdmDocumentoService } from './domain/services/adm.documento.service';
import { AdmMenuPerfilService } from './domain/services/adm.menu-perfil.service';
import { AdmPermisoPerfilService } from './domain/services/adm.permiso-perfil.service';
import { AdmProyectoConfiguracionService } from './domain/services/adm.proyecto-configuracion.service';
import { AdmProyectoFolioService } from './domain/services/adm.proyecto-folio.service';
import { AdmProyectoService } from './domain/services/adm.proyecto.service';

import {
  AuthSesionUsuario,
  AuthSesionUsuarioSchema,
} from '../autenticacion/persistence/database/auth.sesion-usuario.schema';
import {
  AdmAseguradora,
  AdmAseguradoraSchema,
} from './persistence/database/adm.aseguradora.schema';
import {
  AdmConfiguracionAseguradora,
  AdmConfiguracionAseguradoraSchema,
} from './persistence/database/adm.configuracion-aseguradora.schema';
import {
  AdmConfiguracionDocumental,
  AdmConfiguracionDocumentalSchema,
} from './persistence/database/adm.configuracion-documental.schema';
import {
  AdmConfiguracionFirmaCotejo,
  AdmConfiguracionFirmaCotejoSchema,
} from './persistence/database/adm.configuracion-firma-cotejo.schema';
import {
  AdmDocumento,
  AdmDocumentoSchema,
} from './persistence/database/adm.documento.schema';
import {
  AdmMenuPerfil,
  AdmMenuPerfilSchema,
} from './persistence/database/adm.menu-perfil.schema';
import {
  AdmPermisoPerfil,
  AdmPermisoPerfilSchema,
} from './persistence/database/adm.permiso-perfil.schema';
import {
  AdmProyectoConfiguracion,
  AdmProyectoConfiguracionSchema,
} from './persistence/database/adm.proyecto-configuracion.schema';
import {
  AdmProyectoFolio,
  AdmProyectoFolioSchema,
} from './persistence/database/adm.proyecto-folio.schema';
import {
  AdmProyecto,
  AdmProyectoSchema,
} from './persistence/database/adm.proyecto.schema';
import {
  AdmUsuario,
  AdmUsuarioSchema,
} from './persistence/database/adm.usuario.schema';

import { BitNotificacionService } from '../bitacora/domain/services/bit.notificacion.service';
import {
  BitNotificacion,
  BitNotificacionSchema,
} from '../bitacora/persistence/database/bit.notificacion.shema';
import { BitNotificacionRepository } from '../bitacora/persistence/repository/bit.notificacion.repository';
import { CatSharedService } from '../catalogo/domain/services/_cat.shared.service';
import { CatPerfilService } from '../catalogo/domain/services/cat.perfil.service';
import {
  CatCategoriaDocumento,
  CatCategoriaDocumentoSchema,
} from '../catalogo/persistence/database/cat.categoria-documento.schema';
import {
  CatEstatusContactoTelefonico,
  CatEstatusContactoTelefonicoSchema,
} from '../catalogo/persistence/database/cat.estatus-contacto-telefonico.schema';
import {
  CatEstatusGeneral,
  CatEstatusGeneralSchema,
} from '../catalogo/persistence/database/cat.estatus-general.schema';
import {
  CatEstatusUsuario,
  CatEstatusUsuarioSchema,
} from '../catalogo/persistence/database/cat.estatus-usuario.schema';
import {
  CatGiro,
  CatGiroSchema,
} from '../catalogo/persistence/database/cat.giro.schema';
import {
  CatMotivoRechazo,
  CatMotivoRechazoSchema,
} from '../catalogo/persistence/database/cat.motivo-rechazo.schema';
import {
  CatNegocio,
  CatNegocioSchema,
} from '../catalogo/persistence/database/cat.negocio.schema';
import {
  CatOficina,
  CatOficinaSchema,
} from '../catalogo/persistence/database/cat.oficina.schema';
import {
  CatPais,
  CatPaisSchema,
} from '../catalogo/persistence/database/cat.pais.schema';
import {
  CatPerfil,
  CatPerfilSchema,
} from '../catalogo/persistence/database/cat.perfil.schema';
import {
  CatProceso,
  CatProcesoSchema,
} from '../catalogo/persistence/database/cat.proceso.schema';
import {
  CatRamo,
  CatRamoSchema,
} from '../catalogo/persistence/database/cat.ramo.schema';
import {
  CatTipoContacto,
  CatTipoContactoSchema,
} from '../catalogo/persistence/database/cat.tipo-contacto.schema';
import {
  CatTipoLlamada,
  CatTipoLlamadaSchema,
} from '../catalogo/persistence/database/cat.tipo-llamada.schema';
import {
  CatTipoPersona,
  CatTipoPersonaSchema,
} from '../catalogo/persistence/database/cat.tipo-persona.schema';
import { CatCategoriaDocumentoRepository } from '../catalogo/persistence/repository/cat.categoria-documento.repository';
import { CatEstatusContactoTelefonicoRepository } from '../catalogo/persistence/repository/cat.estatus-contacto-telefonico.repository';
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
import { AdmUsuarioService } from './domain/services/adm.usuario.service';
import { AdmAseguradoraRepository } from './persistence/repository/adm.aseguradora.repository';
import { AdmConfiguracionAseguradoraRepository } from './persistence/repository/adm.configuracion-aseguradora.repository';
import { AdmConfiguracionDocumentalRepository } from './persistence/repository/adm.configuracion-documental.repository';
import { AdmConfiguracionFirmaCotejoRepository } from './persistence/repository/adm.configuracion-firma-cotejo.repository';
import { AdmDocumentoRepository } from './persistence/repository/adm.documento.repository';
import { AdmMenuPerfilRepository } from './persistence/repository/adm.menu-perfil.repository';
import { AdmPermisoPerfilRepository } from './persistence/repository/adm.permiso-perfil.repository';
import { AdmProyectoConfiguracionRepository } from './persistence/repository/adm.proyecto-configuracion.repository';
import { AdmProyectoFolioRepository } from './persistence/repository/adm.proyecto-folio.repository';
import { AdmProyectoRepository } from './persistence/repository/adm.proyecto.repository';
import { AdmUsuarioRepository } from './persistence/repository/adm.usuario.repository';
import { AuthSesionUsuarioRepository } from '../autenticacion/persistence/repository/auth.sesion-usuario.repository';
import { CoreTitular, CoreTitularSchema } from '../core/persistence/database/core.titular.schema';
import { CoreTitularRepository } from '../core/persistence/repository/core.titular.repository';
import { NotificationModule } from 'src/notifications/notification.module';

const Models = {
  administracion: [
    { name: AdmAseguradora.name, useFactory: () => AdmAseguradoraSchema },
    {
      name: AdmConfiguracionAseguradora.name,
      useFactory: () => AdmConfiguracionAseguradoraSchema,
    },
    {
      name: AdmConfiguracionDocumental.name,
      useFactory: () => AdmConfiguracionDocumentalSchema,
    },
    {
      name: AdmConfiguracionFirmaCotejo.name,
      useFactory: () => AdmConfiguracionFirmaCotejoSchema,
    },
    { name: AdmDocumento.name, useFactory: () => AdmDocumentoSchema },
    { name: AdmMenuPerfil.name, useFactory: () => AdmMenuPerfilSchema },
    { name: AdmPermisoPerfil.name, useFactory: () => AdmPermisoPerfilSchema },
    { name: AdmProyecto.name, useFactory: () => AdmProyectoSchema },
    { name: AdmProyectoFolio.name, useFactory: () => AdmProyectoFolioSchema },
    {
      name: AdmProyectoConfiguracion.name,
      useFactory: () => AdmProyectoConfiguracionSchema,
    },
    {
      name: AuthSesionUsuario.name,
      useFactory: () => AuthSesionUsuarioSchema,
    },
    { name: AdmUsuario.name, useFactory: () => AdmUsuarioSchema },
  ],
  bitacora: [
    { name: BitNotificacion.name, useFactory: () => BitNotificacionSchema },
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
    { name: CatEstatusGeneral.name, useFactory: () => CatEstatusGeneralSchema },
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
  core: [
    { name: CoreTitular.name, useFactory: () => CoreTitularSchema },
  ]
};

const Repositories = [
  AdmAseguradoraRepository,
  AdmConfiguracionAseguradoraRepository,
  AdmConfiguracionDocumentalRepository,
  AdmConfiguracionFirmaCotejoRepository,
  AdmDocumentoRepository,
  AdmMenuPerfilRepository,
  AdmPermisoPerfilRepository,
  AdmProyectoRepository,
  AdmProyectoConfiguracionRepository,
  AdmProyectoFolioRepository,
  AdmUsuarioRepository,
  BitNotificacionRepository,
  CatCategoriaDocumentoRepository,
  CatEstatusContactoTelefonicoRepository,
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
  CatTipoContactoRepository,
  CatTipoLlamadaRepository,
  CatTipoPersonaRepository,
  AuthSesionUsuarioRepository,
  CoreTitularRepository,
];

const AdmServices = [
  AdmDocumentoService,
  AdmUsuarioService,
  AdmProyectoService,
  AdmAseguradoraService,
  AdmMenuPerfilService,
  AdmConfiguracionAseguradoraService,
  AdmConfiguracionDocumentalService,
  AdmPermisoPerfilService,
  AdmConfiguracionFirmaCotejoService,
  AdmProyectoConfiguracionService,
  AdmProyectoFolioService,
];

const Services = [
  ...AdmServices,
  BitNotificacionService,
  CatSharedService,
  CatPerfilService,
];

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      ...Models.administracion,
      ...Models.bitacora,
      ...Models.catalogo,
      ...Models.core,
    ]),

    SharedServicesModule,
    NotificationModule
  ],
  providers: [...Repositories, ...Services],
  exports: [...AdmServices],
})
export class AdministracionModule {}
