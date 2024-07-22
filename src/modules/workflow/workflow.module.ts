import { Module } from '@nestjs/common';
import { AdmUsuarioRepository } from "../administracion/persistence/repository/adm.usuario.repository";
import { BitActividadRepository } from "../bitacora/persistence/repository/bit.actividad.repository";
import { CatActividadRepository } from "../catalogo/persistence/repository/cat.actividad.repository";
import { CatEstatusActividadRepository } from "../catalogo/persistence/repository/cat.estatus-actividad.repository";
import { CatPerfilRepository } from "../catalogo/persistence/repository/cat.perfil.repository";
import { CoreFolioRepository } from "../core/persistence/repository/core.folio.repository";
import { WorkflowRepository } from "./persistence/repository/workflow.repository";
import { WorkflowActividadRepository } from "./persistence/repository/workflow.actividad.repository";
import { WorkflowConsultarRepository } from "./persistence/repository/workflow.consultar.repository";
import { WorkflowService } from "./domain/services/workflow.service";
import { WorkflowActividadService } from "./domain/services/workflow.actividad.service";
import { WorkflowConsultaService } from "./domain/services/workflow.consulta.service";
import { AdmUsuario, AdmUsuarioSchema } from "../administracion/persistence/database/adm.usuario.schema";
import { BitActividad, BitActividadSchema } from "../bitacora/persistence/database/bit.actividad.schema";
import { CatActividad, CatActividadSchema } from "../catalogo/persistence/database/cat.actividad.schema";
import {
	CatEstatusActividad,
	CatEstatusActividadSchema
} from "../catalogo/persistence/database/cat.estatus-actividad.schema";
import { CatPerfil, CatPerfilSchema } from "../catalogo/persistence/database/cat.perfil.schema";
import { CoreFolio, CoreFolioSchema } from "../core/persistence/database/core.folio.schema";
import { WorkflowActividad, WorkflowActividadSchema } from "./persistence/database/workflow.actividad.schema";
import { MongooseModule } from "@nestjs/mongoose";
import { CoreComentarioService } from '../core/domain/services/core.comentario.service';
import { CoreComentario, CoreComentarioSchema } from '../core/persistence/database/core.comentario.schema';
import { CoreComentarioRepository } from '../core/persistence/repository/core.comentario.repository';
import {CoreFolioReportService} from "../core/domain/services/core.folio-report.service";
import {CoreFolioReportRepository} from "../core/persistence/repository/core.folio-report.repository";

const Repositories = [
	AdmUsuarioRepository,
	BitActividadRepository,
	CatActividadRepository,
	CatEstatusActividadRepository,
	CatPerfilRepository,
	CoreFolioRepository,
	WorkflowRepository,
	WorkflowActividadRepository,
	WorkflowConsultarRepository,
	CoreComentarioRepository,
	CoreFolioReportRepository
];

const Services = [
	WorkflowService,
	WorkflowActividadService,
	WorkflowConsultaService,
	CoreComentarioService,
	CoreFolioReportService,
];

const models = {
	administracion: [
		{ name: AdmUsuario.name, useFactory: () => AdmUsuarioSchema },
	],
	bitacora: [{ name: BitActividad.name, useFactory: () => BitActividadSchema }],
	catalogo: [
		{ name: CatActividad.name, useFactory: () => CatActividadSchema },
		{
			name: CatEstatusActividad.name,
			useFactory: () => CatEstatusActividadSchema,
		},
		{ name: CatPerfil.name, useFactory: () => CatPerfilSchema },
	],
	core: [
		{ name: CoreFolio.name, useFactory: () => CoreFolioSchema },
		{ name: CoreComentario.name, useFactory: () => CoreComentarioSchema }
	],
	workflow: [
		{ name: WorkflowActividad.name, useFactory: () => WorkflowActividadSchema },
	],
};

@Module({
	imports: [
		MongooseModule.forFeatureAsync([
			...models.administracion,
			...models.bitacora,
			...models.catalogo,
			...models.core,
			...models.workflow,
		]),
	],
	providers: [...Repositories, ...Services],
	exports: [...Services],
})
export class WorkflowModule { }
