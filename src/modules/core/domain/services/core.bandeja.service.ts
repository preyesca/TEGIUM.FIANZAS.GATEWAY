import { Controller } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { IPaginateParams } from 'src/app/common/interfaces/paginate-params';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmAseguradoraRepository } from 'src/modules/administracion/persistence/repository/adm.aseguradora.repository';
import { AdmProyectoRepository } from 'src/modules/administracion/persistence/repository/adm.proyecto.repository';
import { BitActividadRepository } from 'src/modules/bitacora/persistence/repository/bit.actividad.repository';
import { CatActividadRepository } from 'src/modules/catalogo/persistence/repository/cat.actividad.repository';
import { CatRiesgoRepository } from 'src/modules/catalogo/persistence/repository/cat.riesgo.repository';
import { WorkflowActividadRepository } from 'src/modules/workflow/persistence/repository/workflow.actividad.repository';
import { CoreFolioRepository } from '../../persistence/repository/core.folio.repository';
import { CorePolizaRepository } from '../../persistence/repository/core.poliza.repository';
import { CoreFlujoConsulta } from '../helpers/dto/core.flujo-consulta';
import { CatPerfilRepository } from 'src/modules/catalogo/persistence/repository/cat.perfil.repository';

@Controller()
export class CoreBandejaService {
  constructor(
    private i18n: I18nService<I18nTranslations>,
    private readonly coreFolioRepository: CoreFolioRepository,
    private readonly corePolizaRepository: CorePolizaRepository,
    private readonly catActividadRepository: CatActividadRepository,
    private readonly catRiesgoRepository: CatRiesgoRepository,
    private readonly bitBitacoraRepository: BitActividadRepository,
    private readonly flowWorkflowRepository: WorkflowActividadRepository,
    private readonly admProyectoRepository: AdmProyectoRepository,
    private readonly admAseguradoraRepository: AdmAseguradoraRepository,
    private readonly catPerfilRepository: CatPerfilRepository

  ) { }

  async entradas(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {

    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {

      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      if (foliosData.length == 0) return DefaultResponse.sendOk('', []);

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const { clave } = await this.catPerfilRepository.findOne(payload.session.rol);

    const workflowResult = await this.flowWorkflowRepository.entradas(
      payload.paginateParams,
      foliosMultisistemaPaginated,
      clave
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];
    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const proyectoFiltroIds = [
      ...new Set(foliosAgregate.map(({ proyecto }) => proyecto.toString())),
    ];

    const foliosFiltro = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      foliosFiltro,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      proyectoFiltroIds,
    );
    const aseguradoraFiltroIds = [
      ...new Set<string>(
        folioPolizas.map(({ aseguradora }) => aseguradora.toString()),
      ),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectIn(aseguradoraFiltroIds),
      this.bitBitacoraRepository.selectInByFoliosBandeja(foliosFiltro),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const riesgo = riesgosCatalogo?.find((r: any) => r.clave === x.riesgo);
      const filterAseguradora: any = aseguradoras.find(
        (a: any) => a._id.toString() === x.aseguradora.toString(),
      );

      return {
        _id: x.folio,
        riesgo: riesgo?.descripcion,
        aseguradora: filterAseguradora.nombreComercial,
        _idAseguradora: filterAseguradora._id,
      };
    });

    workflowResult.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      element.folioMultisistema = folio;
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const proyecto = proyectoFindById.find(
        (p: any) => p._id == x.proyecto.toString(),
      );

      const actividades = actividadesBitacora.find(
        (b: any) =>
          b.actividades?.folio.toString() ===
          x.folioMultisistema?._id.toString(),
      );

      const { descripcion } = actividadesCatalago?.find(
        (a: any) => a.clave === x.actividad,
      );
      const { riesgo, aseguradora, _idAseguradora } = riesgoFolios.find(
        (r) => r._id.toString() === x.folioMultisistema._id.toString(),
      );
      return {
        folio: x.folioMultisistema._id,
        folioCodigo: x.folioMultisistema.folioCliente,
        cliente: x.folioMultisistema?.titular.nombre,
        aseguradora,
        actividad: descripcion,
        estado: actividades?.actividades.estatusBitacora,
        fechaInicio: x.fechaAlta,
        folioMultisistema: x.folioMultisistema?.folioMultisistema,
        titular: x.folioMultisistema?.titular._id,
        proyecto: x.proyecto,
        actividadCodigo: x.actividad,
        actividadId: x._id,
        fechaInicial: x.fechaInicial,
        aseguradoraId: _idAseguradora,
        pais: proyecto?.pais,
        riesgo,
      };
    });
    return DefaultResponse.sendOk('', workflowResult);
  }

  async busquedas(payload: {
    showFinalizados: string;
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {
      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      if (foliosData.length == 0) return DefaultResponse.sendOk('', []);

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const workflowResult = await this.flowWorkflowRepository.busquedas(
      payload.paginateParams,
      payload.showFinalizados,
      payload.session,
      foliosMultisistemaPaginated,
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const proyectoFiltroIds = [
      ...new Set(foliosAgregate.map(({ proyecto }) => proyecto.toString())),
    ];

    const foliosFiltro = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      foliosFiltro,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      proyectoFiltroIds,
    );
    const aseguradoraFiltroIds = [
      ...new Set<string>(
        folioPolizas.map(({ aseguradora }) => aseguradora.toString()),
      ),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectIn(aseguradoraFiltroIds),
      this.bitBitacoraRepository.selectInByFoliosBandeja(foliosFiltro),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const riesgo = riesgosCatalogo?.find((r: any) => r.clave === x.riesgo);
      const filterAseguradora: any = aseguradoras.find(
        (a: any) => a._id.toString() === x.aseguradora.toString(),
      );

      return {
        _id: x.folio,
        riesgo: riesgo?.descripcion,
        aseguradora: filterAseguradora.nombreComercial,
        _idAseguradora: filterAseguradora._id,
      };
    });

    workflowResult.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      element.folioMultisistema = folio;
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const proyecto = proyectoFindById.find(
        (p: any) => p._id == x.proyecto.toString(),
      );

      const actividades = actividadesBitacora.find(
        (b: any) =>
          b.actividades?.folio.toString() ===
          x.folioMultisistema?._id.toString(),
      );

      const { descripcion } = actividadesCatalago?.find(
        (a: any) => a.clave === x.actividad,
      );
      const { riesgo, aseguradora, _idAseguradora } = riesgoFolios.find(
        (r) => r._id.toString() === x.folioMultisistema._id.toString(),
      );
      return {
        folio: x.folioMultisistema._id,
        folioCodigo: x.folioMultisistema.folioCliente,
        cliente: x.folioMultisistema?.titular.nombre,
        aseguradora,
        actividad: descripcion,
        estado: actividades?.actividades.estatusBitacora,
        fechaInicio: x.fechaAlta,
        folioMultisistema: x.folioMultisistema?.folioMultisistema,
        titular: x.folioMultisistema?.titular._id,
        proyecto: x.proyecto,
        actividadCodigo: x.actividad,
        actividadId: x._id,
        fechaInicial: x.fechaInicial,
        aseguradoraId: _idAseguradora,
        pais: proyecto?.pais,
        riesgo,
      };
    });

    return DefaultResponse.sendOk('', workflowResult);
  }

  async reprocesos(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {
      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      if (foliosData.length == 0) return DefaultResponse.sendOk('', []);

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const { clave } = await this.catPerfilRepository.findOne(payload.session.rol);

    const workflowResult = await this.flowWorkflowRepository.reprocesos(
      payload.paginateParams,
      foliosMultisistemaPaginated,
      clave
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const proyectoFiltroIds = [
      ...new Set(foliosAgregate.map(({ proyecto }) => proyecto.toString())),
    ];

    const foliosFiltro = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      foliosFiltro,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      proyectoFiltroIds,
    );
    const aseguradoraFiltroIds = [
      ...new Set<string>(
        folioPolizas.map(({ aseguradora }) => aseguradora.toString()),
      ),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectIn(aseguradoraFiltroIds),
      this.bitBitacoraRepository.selectInByFoliosBandeja(foliosFiltro),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const riesgo = riesgosCatalogo?.find((r: any) => r.clave === x.riesgo);
      const filterAseguradora: any = aseguradoras.find(
        (a: any) => a._id.toString() === x.aseguradora.toString(),
      );

      return {
        _id: x.folio,
        riesgo: riesgo?.descripcion,
        aseguradora: filterAseguradora.nombreComercial,
        _idAseguradora: filterAseguradora._id,
      };
    });

    workflowResult.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      element.folioMultisistema = folio;
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const proyecto = proyectoFindById.find(
        (p: any) => p._id == x.proyecto.toString(),
      );

      const actividades = actividadesBitacora.find(
        (b: any) =>
          b.actividades?.folio.toString() ===
          x.folioMultisistema?._id.toString(),
      );

      const { descripcion } = actividadesCatalago?.find(
        (a: any) => a.clave === x.actividad,
      );
      const { riesgo, aseguradora, _idAseguradora } = riesgoFolios.find(
        (r) => r._id.toString() === x.folioMultisistema._id.toString(),
      );
      return {
        folio: x.folioMultisistema._id,
        folioCodigo: x.folioMultisistema.folioCliente,
        cliente: x.folioMultisistema?.titular.nombre,
        aseguradora,
        actividad: descripcion,
        estado: actividades?.actividades.estatusBitacora,
        fechaInicio: x.fechaAlta,
        folioMultisistema: x.folioMultisistema?.folioMultisistema,
        titular: x.folioMultisistema?.titular._id,
        proyecto: x.proyecto,
        actividadCodigo: x.actividad,
        actividadId: x._id,
        fechaInicial: x.fechaInicial,
        aseguradoraId: _idAseguradora,
        pais: proyecto?.pais,
        riesgo,
      };
    });

    return DefaultResponse.sendOk('', workflowResult);
  }

  async suspendidas(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {
      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      if (foliosData.length == 0) return DefaultResponse.sendOk('', []);

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const { clave } = await this.catPerfilRepository.findOne(payload.session.rol);


    const workflowResult = await this.flowWorkflowRepository.suspendidas(
      payload.paginateParams,
      foliosMultisistemaPaginated,
      clave
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const proyectoFiltroIds = [
      ...new Set(foliosAgregate.map(({ proyecto }) => proyecto.toString())),
    ];

    const foliosFiltro = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      foliosFiltro,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      proyectoFiltroIds,
    );
    const aseguradoraFiltroIds = [
      ...new Set<string>(
        folioPolizas.map(({ aseguradora }) => aseguradora.toString()),
      ),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectIn(aseguradoraFiltroIds),
      this.bitBitacoraRepository.selectInByFoliosBandeja(foliosFiltro),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const riesgo = riesgosCatalogo?.find((r: any) => r.clave === x.riesgo);
      const filterAseguradora: any = aseguradoras.find(
        (a: any) => a._id.toString() === x.aseguradora.toString(),
      );

      return {
        _id: x.folio,
        riesgo: riesgo?.descripcion,
        aseguradora: filterAseguradora.nombreComercial,
        _idAseguradora: filterAseguradora._id,
      };
    });

    workflowResult.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      element.folioMultisistema = folio;
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const proyecto = proyectoFindById.find(
        (p: any) => p._id == x.proyecto.toString(),
      );

      const actividades = actividadesBitacora.find(
        (b: any) =>
          b.actividades?.folio.toString() ===
          x.folioMultisistema?._id.toString(),
      );

      const { descripcion } = actividadesCatalago?.find(
        (a: any) => a.clave === x.actividad,
      );
      const { riesgo, aseguradora, _idAseguradora } = riesgoFolios.find(
        (r) => r._id.toString() === x.folioMultisistema._id.toString(),
      );
      return {
        folio: x.folioMultisistema._id,
        folioCodigo: x.folioMultisistema.folioCliente,
        cliente: x.folioMultisistema?.titular.nombre,
        aseguradora,
        actividad: descripcion,
        estado: actividades?.actividades.estatusBitacora,
        fechaInicio: x.fechaAlta,
        folioMultisistema: x.folioMultisistema?.folioMultisistema,
        titular: x.folioMultisistema?.titular._id,
        proyecto: x.proyecto,
        actividadCodigo: x.actividad,
        actividadId: x._id,
        fechaInicial: x.fechaInicial,
        aseguradoraId: _idAseguradora,
        pais: proyecto?.pais,
        riesgo,
      };
    });

    return DefaultResponse.sendOk('', workflowResult);
  }

  async programadas(payload: {
    paginateParams: IPaginateParams;
    session: SessionTokenDto;
    lang: string;
  }): Promise<ResponseDto> {
    let foliosMultisistemaPaginated = [];

    if (payload.paginateParams.search != '') {
      const foliosData = await this.coreFolioRepository.selectByProyecto(
        payload.paginateParams,
        payload.session.proyecto,
      );

      if (foliosData.length == 0) return DefaultResponse.sendOk('', []);

      foliosMultisistemaPaginated = [
        ...new Set(
          foliosData?.map(({ folioMultisistema }) => folioMultisistema),
        ),
      ];
    }

    const { clave } = await this.catPerfilRepository.findOne(payload.session.rol);

    const workflowResult = await this.flowWorkflowRepository.programadas(
      payload.paginateParams,
      foliosMultisistemaPaginated,
      clave
    );

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const foliosMultisistema = [
      ...new Set(
        workflowResult.docs.map(({ folioMultisistema }) => folioMultisistema),
      ),
    ];

    const foliosAgregate = await this.coreFolioRepository.selectInByFolioFilter(
      foliosMultisistema,
      payload.paginateParams,
      payload.session.proyecto,
    );

    workflowResult.docs = workflowResult.docs.filter(
      (x: any) =>
        foliosAgregate.find(
          (f) => f.folioMultisistema === x.folioMultisistema,
        ) !== undefined,
    );

    const proyectoFiltroIds = [
      ...new Set(foliosAgregate.map(({ proyecto }) => proyecto.toString())),
    ];

    const foliosFiltro = [
      ...new Set(foliosAgregate.map(({ _id }) => _id.toString())),
    ];

    const folioPolizas = await this.corePolizaRepository.selectInByFolio(
      foliosFiltro,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      proyectoFiltroIds,
    );
    const aseguradoraFiltroIds = [
      ...new Set<string>(
        folioPolizas.map(({ aseguradora }) => aseguradora.toString()),
      ),
    ];

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ] = await Promise.all([
      this.admAseguradoraRepository.selectIn(aseguradoraFiltroIds),
      this.bitBitacoraRepository.selectInByFoliosBandeja(foliosFiltro),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const riesgoFolios = folioPolizas.map((x) => {
      const riesgo = riesgosCatalogo?.find((r: any) => r.clave === x.riesgo);
      const filterAseguradora: any = aseguradoras.find(
        (a: any) => a._id.toString() === x.aseguradora.toString(),
      );

      return {
        _id: x.folio,
        riesgo: riesgo?.descripcion,
        aseguradora: filterAseguradora.nombreComercial,
        _idAseguradora: filterAseguradora._id,
      };
    });

    workflowResult.docs.forEach((element: any) => {
      const folio = foliosAgregate.find(
        (p) => p.folioMultisistema === element.folioMultisistema,
      );
      element.folioMultisistema = folio;
    });

    workflowResult.docs = workflowResult.docs.map((x) => {
      const proyecto = proyectoFindById.find(
        (p: any) => p._id == x.proyecto.toString(),
      );

      const actividades = actividadesBitacora.find(
        (b: any) =>
          b.actividades?.folio.toString() ===
          x.folioMultisistema?._id.toString(),
      );

      const { descripcion } = actividadesCatalago?.find(
        (a: any) => a.clave === x.actividad,
      );
      const { riesgo, aseguradora, _idAseguradora } = riesgoFolios.find(
        (r) => r._id.toString() === x.folioMultisistema._id.toString(),
      );
      return {
        folio: x.folioMultisistema._id,
        folioCodigo: x.folioMultisistema.folioCliente,
        cliente: x.folioMultisistema?.titular.nombre,
        aseguradora,
        actividad: descripcion,
        estado: actividades?.actividades.estatusBitacora,
        fechaInicio: x.fechaAlta,
        folioMultisistema: x.folioMultisistema?.folioMultisistema,
        titular: x.folioMultisistema?.titular._id,
        proyecto: x.proyecto,
        actividadCodigo: x.actividad,
        actividadId: x._id,
        fechaInicial: x.fechaInicial,
        aseguradoraId: _idAseguradora,
        pais: proyecto?.pais,
        riesgo,
      };
    });

    return DefaultResponse.sendOk('', workflowResult);
  }

  async workflow(payload: {
    folio: string;
    actividad: number;
    session: SessionTokenDto;
    lang: string;
  }) {
    const folio = await this.coreFolioRepository.findOnePopulate(payload.folio);
    const workflowResult =
      await this.flowWorkflowRepository.selectByFolioActividad(
        folio.folioMultisistema,
        payload.actividad,
        payload.session,
      );
    const workflowUltimaActividadResult =
      await this.flowWorkflowRepository.findUltimaActividadAndEstatus(
        folio.folioMultisistema,
        payload.session,
      );
    const { actividades: workflowUltimaActividad } =
      workflowUltimaActividadResult[0];
    const workflowActividadContactoTelefonicoYAseguradora =
      await this.flowWorkflowRepository.findContactoTelefonicoAndContactoAseguradora(
        folio.folioMultisistema,
        payload.session,
      );
    const [contactoTelefonico, contactoAseguradora] =
      workflowActividadContactoTelefonicoYAseguradora;

    if (!workflowResult) return DefaultResponse.sendOk('', []);

    const folioPolizas = await this.corePolizaRepository.findOneByFolio(
      folio._id,
    );
    const proyectoFindById = await this.admProyectoRepository.selectIn(
      folio.proyecto,
    );

    const [
      aseguradoras,
      actividadesBitacora,
      actividadesCatalago,
      riesgosCatalogo,
    ]: [any[], any[], any[], any[]] = await Promise.all([
      this.admAseguradoraRepository.selectIn([
        folioPolizas.aseguradora.toString(),
      ]),
      this.bitBitacoraRepository.selectInByFoliosBandeja([folio._id]),
      this.catActividadRepository.select(),
      this.catRiesgoRepository.select(),
    ]);

    const { actividades } = actividadesBitacora.find(
      (b: any) => b.actividades.folio.toString() === folio._id.toString(),
    );

    const flujoConsulta: CoreFlujoConsulta = {
      folio: folio._id.toString(),
      folioMultisistema: folio.folioMultisistema,
      actividadActual: workflowResult.actividad,
      actividadActualEstatus: workflowResult.estatus,
      ultimaActividadActual: workflowUltimaActividad.actividad,
      ultimaActividadEstatus: workflowUltimaActividad.estatus,
      actividadContactoTelefonico: contactoTelefonico?.actividad ?? undefined,
      actividadContactoTelefonicoEstatus:
        contactoTelefonico?.estatus ?? undefined,
      actividadContactoAseguradora: contactoAseguradora?.actividad ?? undefined,
      actividadContactoAseguradoraEstatus:
        contactoAseguradora?.estatus ?? undefined,
    };

    const ejecutivoInfo = {
      _id: folio.ejecutivo._id,
      numero: folio.ejecutivo.numero,
      nombre: folio.ejecutivo.nombre,
    };

    const data: any = {
      folio: folio._id.toString(),
      folioCodigo: folio.folioCliente,
      cliente: folio.titular.nombre,
      aseguradora: aseguradoras[0].nombreComercial,
      actividad: actividadesCatalago.find(
        (a: any) => a.clave === workflowResult.actividad,
      ).descripcion,
      estado: actividades.estatusBitacora,
      fechaInicio: actividades.fecha,
      folioMultisistema: folio.folioMultisistema,
      titular: folio.titular._id.toString(),
      ejecutivo: ejecutivoInfo,
      proyecto: folio.proyecto.toString(),
      actividadCodigo: workflowResult.actividad,
      estatusActividad: workflowResult.estatus,
      actividadId: workflowResult._id,
      fechaInicial: workflowResult.fechaInicial,
      aseguradoraId: aseguradoras[0]._id,
      pais: proyectoFindById[0].pais,
      riesgo: riesgosCatalogo.find((r: any) => r.clave === folioPolizas.riesgo)
        .descripcion,
      fechaFinal: workflowResult.fechaFinal,
      flujoConsulta,
    };

    return DefaultResponse.sendOk('', data);
  }
}
