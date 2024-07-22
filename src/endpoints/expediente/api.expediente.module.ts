import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { FileStorageService } from 'src/app/services/shared/file-storage.service';
import { AdministracionModule } from 'src/modules/administracion/administracion.module';
import { CatalogoModule } from 'src/modules/catalogo/catalogo.module';
import { CoreModule } from 'src/modules/core/core.module';
import { ExpedienteModule } from 'src/modules/expediente/expediente.module';
import { ExpArchivoController } from './api/exp.archivo.controller';
import { PaginationMiddleware } from 'src/app/configuration/middleware/pagination.middleware';

@Module({
  imports: [AdministracionModule, CatalogoModule, CoreModule, ExpedienteModule],
  providers: [FileStorageService],
  controllers: [ExpArchivoController],
})
export class ApiExpedienteModule {
  private readonly paths = [
    'find-by-titular-cotejo-paginated',
    'find-by-titular-paginated/:pais/:aseguradora/:proyecto/:titular',
  ];
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes(
      ...this.paths.map((p) => ({
        path: `expedientedigital/archivos/${p}`,
        method: RequestMethod.GET,
      })),
    );
  }
}
