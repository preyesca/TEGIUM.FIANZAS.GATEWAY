import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtStrategy } from 'src/app/configuration/strategies/jwt.strategy';
import { AuthLoginService } from './domain/services/auth.login.service';
import { AuthRefreshTokenService } from './domain/services/auth.refresh-token.service';
import { AuthSesionMfaService } from './domain/services/auth.sesion-mfa.service';

import { NotificationService } from 'src/app/services/shared/notification.service';
import { AdmUsuarioService } from '../administracion/domain/services/adm.usuario.service';
import {
  AdmProyecto,
  AdmProyectoSchema,
} from '../administracion/persistence/database/adm.proyecto.schema';
import {
  AdmUsuario,
  AdmUsuarioSchema,
} from '../administracion/persistence/database/adm.usuario.schema';
import { AdmProyectoRepository } from '../administracion/persistence/repository/adm.proyecto.repository';
import { AdmUsuarioRepository } from '../administracion/persistence/repository/adm.usuario.repository';
import { BitNotificacionService } from '../bitacora/domain/services/bit.notificacion.service';
import {
  BitNotificacion,
  BitNotificacionSchema,
} from '../bitacora/persistence/database/bit.notificacion.shema';
import { BitNotificacionRepository } from '../bitacora/persistence/repository/bit.notificacion.repository';
import { CatSharedService } from '../catalogo/domain/services/_cat.shared.service';
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
import { AuthSesionUsuarioService } from './domain/services/auth.sesion-usuario.service';
import {
  AuthRefreshToken,
  AuthRefreshTokenSchema,
} from './persistence/database/auth.refresh-token.schema';
import {
  AuthSesionMfa,
  AuthSesionMfaSchema,
} from './persistence/database/auth.sesion-mfa.schema';
import {
  AuthSesionUsuario,
  AuthSesionUsuarioSchema,
} from './persistence/database/auth.sesion-usuario.schema';
import { AuthRefreshTokenRepository } from './persistence/repository/auth.refresh-token.repository';
import { AuthSesionMfaRepository } from './persistence/repository/auth.sesion-mfa.repository';
import { AuthSesionUsuarioRepository } from './persistence/repository/auth.sesion-usuario.repository';
import { NotificationModule } from 'src/notifications/notification.module';

const Models = {
  administracion: [
    { name: AdmUsuario.name, useFactory: () => AdmUsuarioSchema },
    { name: AdmProyecto.name, useFactory: () => AdmProyectoSchema },
  ],
  authenticacion: [
    { name: AuthSesionMfa.name, useFactory: () => AuthSesionMfaSchema },
    { name: AuthRefreshToken.name, useFactory: () => AuthRefreshTokenSchema },
    { name: AuthSesionUsuario.name, useFactory: () => AuthSesionUsuarioSchema },
  ],
  bitacora: [
    { name: BitNotificacion.name, useFactory: () => BitNotificacionSchema },
  ],
  catalogos: [
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
    { name: CatOficina.name, useFactory: () => CatOficinaSchema },
    { name: CatNegocio.name, useFactory: () => CatNegocioSchema },
    { name: CatPais.name, useFactory: () => CatPaisSchema },
    { name: CatPerfil.name, useFactory: () => CatPerfilSchema },
    { name: CatProceso.name, useFactory: () => CatProcesoSchema },
    { name: CatRamo.name, useFactory: () => CatRamoSchema },
    { name: CatTipoContacto.name, useFactory: () => CatTipoContactoSchema },
    { name: CatMotivoRechazo.name, useFactory: () => CatMotivoRechazoSchema },
    { name: CatTipoLlamada.name, useFactory: () => CatTipoLlamadaSchema },
    { name: CatTipoPersona.name, useFactory: () => CatTipoPersonaSchema },
  ],
};

const Repositories = [
  AdmUsuarioRepository,
  AdmProyectoRepository,
  AuthRefreshTokenRepository,
  AuthSesionMfaRepository,
  AuthSesionUsuarioRepository,
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
];

const AuthServices = [
  AuthSesionMfaService,
  AuthRefreshTokenService,
  AuthLoginService,
  AuthSesionUsuarioService,
];

const Services = [
  ...AuthServices,
  AdmUsuarioService,
  CatSharedService,
  BitNotificacionService,
  NotificationService,
];

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      ...Models.administracion,
      ...Models.authenticacion,
      ...Models.bitacora,
      ...Models.catalogos,
    ]),
    NotificationModule
  ],
  providers: [JwtStrategy, ...Repositories, ...Services],
  exports: [...AuthServices],
})
export class AutenticacionModule {}
