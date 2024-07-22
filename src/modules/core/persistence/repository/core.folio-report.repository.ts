import {Connection, Types} from "mongoose";
import {Injectable} from "@nestjs/common";
import {InjectConnection} from "@nestjs/mongoose";
import {
	ComentarioType,
	ConfiguracionDocumentalType,
	ContactoTelefonicoType, FlowValidacionDocumentalType,
	FolioReportType, TaskActividadReminderType, WorkflowType
} from "../../domain/helpers/interfaces/folio-report-type.interface";
import {CollectionEnum} from "../../domain/helpers/enum/collection.enum";
import MIGRATION from "../query/migration.query";


@Injectable()
export class CoreFolioReportRepository {
	constructor(@InjectConnection() private connection: Connection) {
	}


	async ensureCollectionExists(collectionName: string): Promise<void> {
		const collections = await this.connection.db.listCollections().toArray();
		const collectionExists = collections.some(
			(collection) => collection.name === collectionName,
		);
		if (!collectionExists)
			await this.connection.db.createCollection(collectionName);
	}

	async create(createDto: any) {
		await this.ensureCollectionExists(CollectionEnum.NAME_COLLECTION);
		try {
			await this.connection
				.collection(CollectionEnum.NAME_COLLECTION)
				.insertOne(createDto);
		} catch (e) {
			console.log(e);
		}
	}

	async countFolios() {
		await this.ensureCollectionExists(CollectionEnum.NAME_COLLECTION);
		try {
			return await this.connection
				.collection(CollectionEnum.NAME_COLLECTION).countDocuments();
		} catch (e) {
			console.log(e);
			return 0;
		}
	}

	async cleanData() {
		await this.connection.collection(CollectionEnum.NAME_COLLECTION)
			.deleteMany({})
	}

	async findOne(idFolio: string) {
		try {
			return await this.connection
				.collection(CollectionEnum.NAME_COLLECTION)
				.findOne({_id: new Types.ObjectId(idFolio)});
		} catch (e) {
			console.log(e);
			return null;
		}
	}

	async getWorkflowByFolio(folioMultisistema: number): Promise<WorkflowType[]> {
		try {
			return this.connection
				.collection(CollectionEnum.WORKFLOW_ACTIVIDADES)
				.aggregate<WorkflowType>([
					{
						$match: {
							folioMultisistema: folioMultisistema,
						},
					},
					{
						$lookup: {
							from: 'cat.actividades',
							localField: 'actividad',
							foreignField: 'clave',
							as: 'actividad',
						},
					},
					{
						$unwind: '$actividad',
					},
					{
						$lookup: {
							from: 'cat.estatus-actividades',
							localField: 'estatus',
							foreignField: 'clave',
							as: 'estatus',
						},
					},
					{
						$unwind: '$estatus',
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async getArchivosByAseguradoraAndTitular(
		aseguradora: string,
		titular: string,
	) {
		try {
			return this.connection
				.collection(CollectionEnum.EXPEDIENTE_ARCHIVOS)
				.aggregate([
					{
						$match: {
							aseguradora: new Types.ObjectId(aseguradora),
							titular: new Types.ObjectId(titular),
						},
					},
					{
						$lookup: {
							from: 'adm.documentos',
							localField: 'documento',
							foreignField: '_id',
							as: 'documento',
						},
					},
					{
						$unwind: '$documento',
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async getComentarioByBitacoraDetail(folio: string) {
		try {
			return this.connection
				.collection(CollectionEnum.COMENTARIOS)
				.aggregate<ComentarioType>([
					{
						$match: {
							folio: new Types.ObjectId(folio),
						},
					},
					{
						$unwind: '$actividades',
					},
					{
						$lookup: {
							from: 'cat.actividades',
							localField: 'actividades.actividad',
							foreignField: 'clave',
							as: 'actividad',
						},
					},
					{
						$unwind: '$actividad',
					},
					{
						$lookup: {
							from: 'bitacora.actividades',
							localField: 'actividades.bitacora',
							foreignField: '_id',
							as: 'bitacora',
						},
					},
					{
						$project: {
							_id: 1,
							folio: 1,
							actividades: {
								comentarios: '$actividades.comentarios',
								bitacora: {
									$cond: {
										if: {$gt: [{$size: '$bitacora'}, 0]},
										then: {$arrayElemAt: ['$bitacora', 0]},
										else: null,
									},
								},
								actividad: '$actividad',
								fecha: '$actividades.fecha',
							},
						},
					},
					{
						$group: {
							_id: '$_id',
							folio: {
								$first: '$folio',
							},
							actividades: {
								$push: '$actividades',
							},
						},
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async getConfiguracionDocumentalDetail(
		proyecto: string,
		aseguradora: string,
		tipoPersona: number,
	) {
		try {
			return this.connection
				.collection(CollectionEnum.CONFIGURACION_DOCUMENTAL)
				.aggregate<ConfiguracionDocumentalType>([
					{
						$match: {
							aseguradora: new Types.ObjectId(aseguradora),
							proyecto: new Types.ObjectId(proyecto),
							tipoPersona: tipoPersona,
						},
					},
					{
						$lookup: {
							from: 'cat.tipos-persona',
							localField: 'tipoPersona',
							foreignField: 'clave',
							as: 'tipoPersona',
						},
					},
					{
						$unwind: '$tipoPersona',
					},
					{
						$unwind: '$documento',
					},
					{
						$lookup: {
							from: 'adm.documentos',
							localField: 'documento.documento',
							foreignField: '_id',
							as: 'documentoResult',
						},
					},
					{
						$unwind: '$documentoResult',
					},
					{
						$project: {
							_id: 1,
							pais: 1,
							aseguradora: 1,
							proyecto: 1,
							tipoPersona: 1,
							giro: 1,
							estatus: 1,
							documento: {
								documento: '$documentoResult',
								activo: '$documento.activo',
								obligatorio: '$documento.obligatorio',
								ocr: '$documento.ocr',
								vigencia: '$documento.vigencia',
								motivosRechazo: '$documento.motivosRechazo',
							},
						},
					},
					{
						$group: {
							_id: '$_id',
							pais: {$first: '$pais'},
							aseguradora: {$first: '$aseguradora'},
							proyecto: {$first: '$proyecto'},
							tipoPersona: {$first: '$tipoPersona'},
							giro: {$first: '$giro'},
							estatus: {$first: '$estatus'},
							documento: {
								$push: '$documento',
							},
						},
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async getFlowContactoTelefonico(folio: string) {
		try {
			// FLOW_CONTACTO_TELEFONICO
			return this.connection
				.collection(CollectionEnum.FLOW_CONTACTO_TELEFONICO)
				.aggregate<ContactoTelefonicoType>([
					{
						$match: {
							folio: new Types.ObjectId(folio),
						},
					},
					{
						$lookup: {
							from: 'cat.estatus-contacto-telefonico',
							localField: 'estatus',
							foreignField: 'clave',
							as: 'estatus',
						},
					},
					{
						$unwind: '$estatus',
					},
					{
						$lookup: {
							from: 'cat.tipos-llamada',
							localField: 'tipoLlamada',
							foreignField: 'clave',
							as: 'tipoLlamada',
						},
					},
					{
						$unwind: '$tipoLlamada',
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async getFlowValidationDocumentaByFolio(
		folio: string,
	): Promise<FlowValidacionDocumentalType> {
		try {
			return await this.connection
				.collection(CollectionEnum.FLOW_VALIDACION_DOCUMENTAL)
				.findOne<FlowValidacionDocumentalType>({
					folio: new Types.ObjectId(folio),
				});
		} catch (e) {
			console.log(e);
		}
	}

	async getTaskRemiderByFolio(folio: string) {
		try {
			return this.connection
				.collection(CollectionEnum.TASK_ACTIVIDAD_REMINDER)
				.aggregate<TaskActividadReminderType>([
					{
						$match: {
							folio: new Types.ObjectId(folio),
						},
					},
					{
						$lookup: {
							from: 'cat.actividades',
							localField: 'actividad',
							foreignField: 'clave',
							as: 'actividad',
						},
					},
					{
						$unwind: '$actividad',
					},
				])
				.toArray();
		} catch (e) {
			console.log(e);
		}
	}

	async updateFieldById(folio: string, field: string, data: any) {
		try {
			const updateQuery: any = {};
			updateQuery[field] = data;
			await this.connection
				.collection(CollectionEnum.NAME_COLLECTION)
				.findOneAndUpdate(
					{
						_id: new Types.ObjectId(folio),
					},
					{
						$set: updateQuery,
					},
				);
		} catch (e) {
			console.log(e);
		}
	}

	async findByDate(
		fechaInicial: moment.Moment,
		fechaFinal: moment.Moment,
	): Promise<FolioReportType[]> {
		return await this.connection
			.collection(CollectionEnum.NAME_COLLECTION)
			.find<FolioReportType>({
				fechaAlta: {
					$gte: new Date(`${fechaInicial.toISOString()}`),
					$lt: new Date(`${fechaFinal.toISOString()}`),
				},
			})
			.toArray();
	}

	async migration() {
		return await this.connection
			.collection(CollectionEnum.CORE_FOLIOS)
			.aggregate<FolioReportType>([...MIGRATION])
			.toArray();
	}
}
