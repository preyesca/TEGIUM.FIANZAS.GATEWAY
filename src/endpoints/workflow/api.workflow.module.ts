import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { PaginationMiddleware } from 'src/app/configuration/middleware/pagination.middleware';
import { AdministracionModule } from 'src/modules/administracion/administracion.module';
import { AutenticacionModule } from 'src/modules/autenticacion/autenticacion.module';
import { CatalogoModule } from 'src/modules/catalogo/catalogo.module';
import { CoreModule } from 'src/modules/core/core.module';
import { WorkflowModule } from 'src/modules/workflow/workflow.module';
import { WorkflowController } from './api/workflow.controller';

@Module({
	imports: [
		AdministracionModule,
		CatalogoModule,
		AutenticacionModule,
		WorkflowModule,
		CoreModule,
	],
	providers: [WorkflowController],
	controllers: [WorkflowController],
})
export class ApiWorkflowModule {
	private readonly paths = [
		'avanzar-workflow', //actividades-by-folio-paginated
		'iniciar-workflow',
	];

	//  workflow/actividades-by-folio-paginated/paginate
	// if you can not filter or use paginate it is for the middlewar have under...

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(PaginationMiddleware).forRoutes(
			...this.paths.map((p) => ({
				path: `workflow/${p}/paginate`,
				method: RequestMethod.GET,
			})),
		);
	}
}
