import {Module} from '@nestjs/common';
import {CatalogoModule} from 'src/modules/catalogo/catalogo.module';
import {CatActividadController} from './api/cat.actividad.controller';
import {CatCategoriaDocumentoController} from './api/cat.categoria-documento.controller';
import {CatEstatusActividadController} from './api/cat.estatus-actividad.controller';
import {CatEstatusContactoTelefonicoController} from './api/cat.estatus-contacto-telefonico.controller';
import {CatEstatusGeneralController} from './api/cat.estatus-general.controller';
import {CatEstatusUsuarioController} from './api/cat.estatus-usuario.controller';
import {CatGiroController} from './api/cat.giro.controller';
import {CatMotivoRechazoController} from './api/cat.motivo-rechazo.controller';
import {CatNegocioController} from './api/cat.negocio.controller';
import {CatPaisController} from './api/cat.pais.controller';
import {catPerfilController} from './api/cat.perfil.controller';
import {CatProcesoController} from './api/cat.proceso.controller';
import {CatRamoController} from './api/cat.ramo.controller';
import {CatRiesgoController} from './api/cat.riesgo.controller';
import {CatTipoCargaController} from './api/cat.tipo-carga.controller';
import {CatTipoContactoController} from './api/cat.tipo-contacto.controller';
import {CatTipoLlamadaController} from './api/cat.tipo-llamada.controller';
import {CatTipoMovimientoController} from './api/cat.tipo-movimiento.controller';
import {CatTipoPersonaController} from './api/cat.tipo-persona.controller';
import {CatUnidadController} from './api/cat.unidad.controller';
import {CatReporteController} from "./api/cat.reporte.controller";

@Module({
	imports: [CatalogoModule],
	controllers: [
		CatActividadController,
		CatCategoriaDocumentoController,
		CatEstatusActividadController,
		CatEstatusContactoTelefonicoController,
		CatEstatusGeneralController,
		CatEstatusUsuarioController,
		CatGiroController,
		CatMotivoRechazoController,
		CatNegocioController,
		CatPaisController,
		catPerfilController,
		CatProcesoController,
		CatRamoController,
		CatRiesgoController,
		CatTipoCargaController,
		CatTipoContactoController,
		CatTipoLlamadaController,
		CatTipoMovimientoController,
		CatTipoPersonaController,
		CatUnidadController,
		CatReporteController
	],
})
export class ApiCatalogoModule {
}
