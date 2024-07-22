import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SharedServicesModule } from 'src/app/services/services.module';
import {
  AdmUsuario,
  AdmUsuarioSchema,
} from '../administracion/persistence/database/adm.usuario.schema';
import { AdmUsuarioRepository } from '../administracion/persistence/repository/adm.usuario.repository';
import {
  CatActividad,
  CatActividadSchema,
} from '../catalogo/persistence/database/cat.actividad.schema';
import { CatActividadRepository } from '../catalogo/persistence/repository/cat.actividad.repository';
import { BitActividadService } from './domain/services/bit.actividad.service';
import { BitNotificacionService } from './domain/services/bit.notificacion.service';
import {
  BitActividad,
  BitActividadSchema,
} from './persistence/database/bit.actividad.schema';
import {
  BitNotificacion,
  BitNotificacionSchema,
} from './persistence/database/bit.notificacion.shema';
import { BitActividadRepository } from './persistence/repository/bit.actividad.repository';
import { BitNotificacionRepository } from './persistence/repository/bit.notificacion.repository';
import { CoreFolioRepository } from '../core/persistence/repository/core.folio.repository';
import { CoreComentarioRepository } from '../core/persistence/repository/core.comentario.repository';
import { CoreFolio, CoreFolioSchema } from '../core/persistence/database/core.folio.schema';
import { CoreComentario, CoreComentarioSchema } from '../core/persistence/database/core.comentario.schema';
import { CoreComentarioService } from '../core/domain/services/core.comentario.service';
import { NotificationModule } from 'src/notifications/notification.module';
import {CoreFolioReportService} from "../core/domain/services/core.folio-report.service";
import {CoreFolioReportRepository} from "../core/persistence/repository/core.folio-report.repository";


const Repositories = [
  AdmUsuarioRepository,
  BitActividadRepository,
  BitNotificacionRepository,
  CatActividadRepository,
  CoreFolioRepository,
  CoreComentarioRepository,
  CoreFolioReportRepository
];

const Services = [
  BitActividadService,
  BitNotificacionService,
  CoreComentarioService,
  CoreFolioReportService

];

const models = {
  administracion: [
    { name: AdmUsuario.name, useFactory: () => AdmUsuarioSchema },
  ],
  catalogo: [{ name: CatActividad.name, useFactory: () => CatActividadSchema }],
  core: [
    { name: CoreFolio.name, useFactory: () => CoreFolioSchema },
    { name: CoreComentario.name, useFactory: () => CoreComentarioSchema },
  ],
  bitacora: [
    { name: BitActividad.name, useFactory: () => BitActividadSchema },
    { name: BitNotificacion.name, useFactory: () => BitNotificacionSchema },
  ],
};

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      ...models.administracion,
      ...models.bitacora,
      ...models.catalogo,
      ...models.core,
    ]),

    SharedServicesModule,
    NotificationModule
  ],
  providers: [...Repositories, ...Services],
  exports: [BitActividadService, BitNotificacionService],
})
export class BitacoraModule {}
