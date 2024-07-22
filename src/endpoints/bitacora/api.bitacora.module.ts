import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PaginationMiddleware } from 'src/app/configuration/middleware/pagination.middleware';
import { BitacoraModule } from 'src/modules/bitacora/bitacora.module';
import { CatalogoModule } from 'src/modules/catalogo/catalogo.module';
import { BitActividadController } from './api/bit.actividad.controller';

@Module({
  imports: [CatalogoModule, BitacoraModule],
  controllers: [BitActividadController],
})
export class ApiBitacoraModule {
  private readonly paths = ['select-by-folio', 'select-by-folio-for-detalle'];

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes(
      ...this.paths.map((p) => ({
        path: `bitacora/actividad/${p}/:idFolio`,
        method: RequestMethod.GET,
      })),
    );
  }
}
