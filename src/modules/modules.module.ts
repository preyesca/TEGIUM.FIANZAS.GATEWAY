import { Module } from '@nestjs/common';
import { AdministracionModule } from './administracion/administracion.module';
import { AutenticacionModule } from './autenticacion/autenticacion.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { CatalogoModule } from './catalogo/catalogo.module';
import { CoreModule } from './core/core.module';
import { ExpedienteModule } from './expediente/expediente.module';
import { WorkflowModule } from './workflow/workflow.module';

const SharedModules = [
  AdministracionModule,
  AutenticacionModule,
  BitacoraModule,
  CatalogoModule,
    CoreModule,
    ExpedienteModule,
    WorkflowModule,
];

@Module({
  imports: [...SharedModules],
  exports: [...SharedModules],
})
export class ModulesModule {}
