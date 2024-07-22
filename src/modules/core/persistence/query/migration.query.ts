const MIGRATION: any[] = [
	{
		$lookup: {
			from: 'core.titulares',
			localField: 'titular',
			foreignField: '_id',
			as: 'titular',
		},
	},
	{
		$unwind: {
			path: '$titular',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'core.informacion-ejecutivo',
			localField: 'ejecutivo',
			foreignField: '_id',
			as: 'ejecutivo',
		},
	},
	{
		$unwind: {
			path: '$ejecutivo',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'cat.tipos-carga',
			localField: 'tipoCarga',
			foreignField: 'clave',
			as: 'tipoCarga',
		},
	},
	{
		$unwind: {
			path: '$tipoCarga',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'cat.tipos-movimiento',
			localField: 'tipoMovimiento',
			foreignField: 'clave',
			as: 'tipoMovimiento',
		},
	},
	{
		$unwind: {
			path: '$tipoMovimiento',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'cat.giros',
			localField: 'giro',
			foreignField: 'clave',
			as: 'giro',
		},
	},
	{
		$unwind: {
			path: '$giro',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'adm.usuarios',
			localField: 'usuario',
			foreignField: '_id',
			as: 'usuario',
		},
	},
	{
		$unwind: {
			path: '$usuario',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'adm.proyectos',
			localField: 'proyecto',
			foreignField: '_id',
			as: 'proyecto',
		},
	},
	{
		$unwind: {
			path: '$proyecto',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'core.polizas',
			localField: '_id',
			foreignField: 'folio',
			as: 'poliza',
		},
	},
	{
		$unwind: {
			path: '$poliza',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'cat.riesgos',
			localField: 'poliza.riesgo',
			foreignField: 'clave',
			as: 'riesgo',
		},
	},
	{
		$unwind: {
			path: '$riesgo',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'cat.unidades',
			localField: 'poliza.unidad',
			foreignField: 'clave',
			as: 'unidad',
		},
	},
	{
		$unwind: {
			path: '$unidad',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$lookup: {
			from: 'adm.aseguradoras',
			localField: 'poliza.aseguradora',
			foreignField: '_id',
			as: 'aseguradora',
		},
	},
	{
		$unwind: {
			path: '$aseguradora',
			preserveNullAndEmptyArrays: true,
		},
	},
	{
		$set: {
			poliza: {
				riesgo: '$riesgo',
				aseguradora: '$aseguradora',
				unidad: '$unidad',
			},
		},
	},
	{
		$unset: ['riesgo', 'aseguradora', 'unidad', 'usuario.contrasena'],
	},
];

export default MIGRATION;
