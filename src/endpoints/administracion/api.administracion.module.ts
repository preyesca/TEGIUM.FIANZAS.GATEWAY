import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PaginationMiddleware } from 'src/app/configuration/middleware/pagination.middleware';
import { SharedServicesModule } from 'src/app/services/services.module';
import { AdministracionModule } from 'src/modules/administracion/administracion.module';
import { AutenticacionModule } from 'src/modules/autenticacion/autenticacion.module';
import { CatalogoModule } from 'src/modules/catalogo/catalogo.module';
import { AdmAseguradoraController } from './api/adm.aseguradora.controller';
import { AdmConfiguracionAseguradoraController } from './api/adm.configuracion-aseguradora.controller';
import { AdmConfiguracionDocumentalController } from './api/adm.configuracion-documental.controller';
import { AdmConfiguracionFirmaCotejoController } from './api/adm.configuracion-firma-cotejo.controller';
import { AdmDocumentoController } from './api/adm.documento.controller';
import { AdmMenuPerfilController } from './api/adm.menu-perfil.controller';
import { AdmPermisoPerfilController } from './api/adm.permiso-perfil.controller';
import { AdmProyectoController } from './api/adm.proyecto.controller';
import { AdmUsuarioController } from './api/adm.usuario.controller';
import { AuthSesionUsuarioRepository } from 'src/modules/autenticacion/persistence/repository/auth.sesion-usuario.repository';

@Module({
  imports: [
    CatalogoModule,
    AdministracionModule,
    AutenticacionModule,
    SharedServicesModule,
  ],
  providers: [],
  controllers: [
    AdmAseguradoraController,
    AdmDocumentoController,
    AdmMenuPerfilController,
    AdmPermisoPerfilController,
    AdmProyectoController,
    AdmUsuarioController,
    AdmConfiguracionDocumentalController,
    AdmConfiguracionFirmaCotejoController,
    AdmConfiguracionAseguradoraController,
  ],
})
export class ApiAdministracionModule {
  private readonly paths = [
    'aseguradora',
    'documento',
    'configuracion-aseguradora',
    'configuracion-documental',
    'configurador-firma-cotejo',
    'proyecto',
    'usuario',
  ];

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(PaginationMiddleware).forRoutes(
      ...this.paths.map((p) => ({
        path: `administracion/${p}/paginate`,
        method: RequestMethod.GET,
      })),
    );
  }
}
