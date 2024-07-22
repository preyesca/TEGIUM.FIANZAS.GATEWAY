import {MiddlewareConsumer, Module, RequestMethod} from '@nestjs/common';
import {PaginationMiddleware} from 'src/app/configuration/middleware/pagination.middleware';
import {FileStorageService} from 'src/app/services/shared/file-storage.service';
import {AdministracionModule} from 'src/modules/administracion/administracion.module';
import {CatalogoModule} from 'src/modules/catalogo/catalogo.module';
import {CoreModule} from 'src/modules/core/core.module';
import {FlowFirmaClienteController} from './api/flows/flow.firma-cliente.controller';
import {FlowFirmaEjecutivoController} from './api/flows/flow.firma-ejecutivo.controller';
import {FlowConfirmacionEntregaController} from './api/flows/flow.confirmacion-entrega.controller';
import {FlowContactoTelefonicoController} from './api/flows/flow.contacto-telefonico.controller';
import {FlowListaNegraController} from './api/flows/flow.lista-negra.controller';
import {FlowValidacionDigitalController} from './api/flows/flow.validacion-digital.controller';
import {FlowValidacionFirmaController} from './api/flows/flow.validacion-firma.controller';
import {CoreFolioController} from "./api/core.folio.controller";
import {CoreComentarioController} from "./api/core.comentario.controller";
import {CoreTitularController} from "./api/core.titular.controller";
import {FlowValidacionOriginalController} from './api/flows/flow.validacion-original.controller';
// import { ExpedienteModule } from 'src/modules/expediente/expediente.module';
// import { CoreBandejaController } from './api/core.bandeja.controller';
// import { CoreComentarioController } from './api/core.comentario.controller';
// import { CoreFolioController } from './api/core.folio.controller';
import {CorePortalController} from './api/core.portal.controller';
import {FlowSolicitudController} from './api/flows/flow.solicitud.controller';
import {CoreBandejaController} from './api/core.bandeja.controller';
import {FlowValidacionAfianzadoraController} from './api/flows/flow.validacion-afianzadora.controller';
import {FlowRecoleccionFisicosController} from "./api/flows/flow.recoleccion-fisicos.controller";
import {ExpedienteModule} from 'src/modules/expediente/expediente.module';
import {CoreReporteController} from "./api/core.reporte.controller";
// import { FlowContactoTelefonicoController } from './api/flows/flow.contacto-telefonico.controller';
// import { FlowListaNegraController } from './api/flows/flow.lista-negra.controller';
// import { FlowValidacionDigitalController } from './api/flows/flow.validacion-digital.controller';
// import { FlowValidacionFirmaController } from './api/flows/flow.validacion-firma.controller';
@Module({
	imports: [
		AdministracionModule,
		CatalogoModule,
		CoreModule,
		ExpedienteModule
	],
	providers: [FileStorageService],
	controllers: [
		CoreBandejaController,
		CoreComentarioController,
		CoreFolioController,
		CoreReporteController,
		// CoreSolicitudController,
		CorePortalController,
		FlowConfirmacionEntregaController,
		FlowContactoTelefonicoController,
		CoreTitularController,
		FlowFirmaClienteController,
		FlowFirmaEjecutivoController,
		FlowListaNegraController,
		FlowRecoleccionFisicosController,
		FlowValidacionDigitalController,
		FlowValidacionFirmaController,
		FlowValidacionOriginalController,
		FlowSolicitudController,
		FlowValidacionAfianzadoraController
	],
})
export class ApiCoreModule {
	private readonly paths = [
		'bandeja/entradas',
		'bandeja/reprocesos',
		'bandeja/suspendidas',
		'bandeja/programadas',
		'lista-negra/findAll',
		'contacto-telefonico/find-all/:idFolio',
		'expediente-digital/select-by-folio/:idFolio',
		'bandeja/busqueda/:showFinalizados',
		'firma-ejecutivo/find-all',
		'folio/find-layout/:header',
		'folio/paginateLayouts',
		'lista-negra/findAll',
		'titular/find-all',
		'titular/find-titular-solicitudes',
		'validacion-digital/find-all',
		'validacion-firmas/find-all',
	];

	configure(consumer: MiddlewareConsumer) {
		consumer.apply(PaginationMiddleware).forRoutes(
			...this.paths.map((p) => ({
				path: `core/${p}`,
				method: RequestMethod.GET,
			})),
		);
	}
}
