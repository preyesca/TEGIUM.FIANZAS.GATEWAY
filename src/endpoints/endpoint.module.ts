import { Module } from '@nestjs/common';
import { ModulesModule } from 'src/modules/modules.module';
import { ApiAdministracionModule } from './administracion/api.administracion.module';
import { ApiAutenticacionModule } from './autenticacion/api.autenticacion.module';
import { ApiBitacoraModule } from './bitacora/api.bitacora.module';
import { ApiCatalogoModule } from './catalogo/api.catalogo.module';
// import { ApiCatalogoModule } from './catalogo/api.catalogo.module';
import { ApiCoreModule } from './core/api.core.module';
import { ApiExpedienteModule } from './expediente/api.expediente.module';
import { ApiWorkflowModule } from './workflow/api.workflow.module';

@Module({
  imports: [
    ApiCatalogoModule,
    ApiAdministracionModule,
    ApiAutenticacionModule,
    ApiBitacoraModule,
    ApiCoreModule,
    ApiExpedienteModule,
    ApiWorkflowModule,
  ],
  providers: [ModulesModule],
  exports: [ModulesModule],
})
export class EndpointModule {
}
