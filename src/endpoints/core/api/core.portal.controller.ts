import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext, I18nService } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { EStorageFolder } from 'src/app/common/enum/catalogo/directory.enum';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FileStorageService } from 'src/app/services/shared/file-storage.service';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { HelperFileValidator } from 'src/app/utils/validators/file.validator';
import { ExpArchivoRequestDto } from 'src/endpoints/expediente/helpers/exp.archivo.request.dto';
import { AdmDocumentoService } from 'src/modules/administracion/domain/services/adm.documento.service';
import { FlowFirmaClienteDto } from 'src/modules/core/domain/helpers/dto/flows/flow.firma-cliente.dto';
import { FlowRecoleccionFisicosDTO } from 'src/modules/core/domain/helpers/dto/flows/flow.recoleccion-fisicos.dto';
import { CoreComentarioService } from 'src/modules/core/domain/services/core.comentario.service';
import { CorePortalAseguradoService } from 'src/modules/core/domain/services/core.portal.service';
import { CoreTitularService } from 'src/modules/core/domain/services/core.titular.service';
import { FlowFirmaClienteService } from 'src/modules/core/domain/services/flows/flow.firma-cliente.service';
import { FlowRecoleccionFisicosServices } from 'src/modules/core/domain/services/flows/flow.recoleccion-fisicos.service';
import { FlowValidacionDigitalService } from 'src/modules/core/domain/services/flows/flow.validacion-digital.service';
import { ExpArchivoDto } from 'src/modules/expediente/domain/helpers/dto/exp.archivo.dto';
import { ExpArchivoService } from 'src/modules/expediente/domain/services/exp.archivo.service';

@Controller(`${SwaggerConsts.CORE.controller}/portal-asegurado`)
@ApiTags(SwaggerConsts.CORE.children.PORTAL)
// @ApiBearerAuth()
// @UseGuards(JWTAuthGuard)
export class CorePortalController {
  constructor(
    private readonly serviceFileStorage: FileStorageService,
    private i18n: I18nService<I18nTranslations>,
    private readonly admDocumentoService: AdmDocumentoService,
    private readonly coreTitularService: CoreTitularService,
    private readonly coreComentarioService: CoreComentarioService,
    private readonly expArchivoService: ExpArchivoService,
    private readonly fileStorageService: FileStorageService,
    private readonly corePortalService: CorePortalAseguradoService,
    private readonly flowRecoleccionFisicosService: FlowRecoleccionFisicosServices,
    private readonly flowValidacionDigitalService: FlowValidacionDigitalService,
    private readonly flowFirmaClienteService: FlowFirmaClienteService,
    private readonly config: ConfigService,
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ExpArchivoRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    if (!HelperFileValidator.isValid(file))
      return DefaultResponse.sendBadRequest('all.VALIDATIONS.FILE.REQUIRED');

    const documentoResult = await this.admDocumentoService.selectOne(
      body.documento.toString(),
    );

    if (!documentoResult.success) return documentoResult;

    const documento = documentoResult.data;

    if (documento === null) {
      return DefaultResponse.sendNotFound(
        this.i18n.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
          lang: i18n.lang,
        }),
      );
    }

    const cliente = await this.coreTitularService.findOne({
      titular: body.titular.toString(),
      lang: i18n.lang,
    });

    const version = await this.expArchivoService.findVersion({
      titular: body.titular.toString(),
      documento: body.documento.toString(),
    });

    const nombreBase = documento.nombreBase;
    const extension = file.originalname.substring(
      file.originalname.lastIndexOf('.'),
      file.originalname.length,
    );

    body.version = version ?? 1;
    body.nombreOriginal = file.originalname;
    body.nombreCorto = `${nombreBase}_v${body.version}${extension}`;
    body.contentType = file.mimetype;
    const storageResponse = await this.fileStorageService.upload(
      EProceso.FIANZAS,
      EStorageFolder.EXPEDIENTES,
      i18n.lang,
      file,
      `${cliente.numeroCliente}{sep}${body.nombreCorto}`,
    );

    if (!storageResponse.success) {
      return DefaultResponse.sendConflict(
        this.i18n.translate('expediente.FILE.ERROR.SAVE', {
          lang: i18n.lang,
        }),
      );
    }

    body.url = storageResponse.data;

    const expedienteResult = await this.expArchivoService.create({
      data: body,
      lang: i18n.lang,
    });

    if (!expedienteResult.success) return expedienteResult;

    const expediente = expedienteResult.data;

    expedienteResult.data = {
      _id: expediente._id,
      aseguradora: expediente.aseguradora,
      titular: expediente.titular,
      documento: expediente.documento,
      nombreOriginal: file.originalname,
      nombreCorto: expediente.nombreCorto,
      version: body.version,
      url: body.url,
      usuarioAlta: body.usuarioAlta,
      fechaHoraAlta: body.fechaHoraAlta,
      fechaHoraVigencia: body.fechaHoraVigencia,
      eliminado: false,
      usuarioElimina: null,
      fechaHoraElimina: null,
      archivo: body.archivo,
      mimetype: body.mimetype,
      clave: documento.clave,
      archivoSize: file.size
    } as ExpArchivoDto;

    return expedienteResult;
  }

  @Post('avanzar-portal')
  async avanzarActividad(@Body() data: any, @Request() req: any, @I18n() i18n: I18nContext) {
    return await this.corePortalService.avanzarPortal(data, req?.user, i18n);
  }

  @Post('save-recoleccion-fisicos')
  async createOrUpdate(
    @Request() req: any,
    @Body() body: FlowRecoleccionFisicosDTO,
    @I18n() i18n: I18nContext,
  ) {
    return await this.flowRecoleccionFisicosService.create({
      body,
      lang: i18n.lang,
      session: req.user,
    });
  }

  @Get('find-one-to-edit-recoleccion-fisicos/:id')
  async findOneToEditRecoleccionFisicos(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Request() req?: any,
  ) {
    return await this.flowRecoleccionFisicosService.findOneToEdit({
      id,
      lang: i18n.lang,
      session: req.user,
    });
  }

  @Get('select-by-titular')
  async getInfo(
    @Query('pais') pais: number,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.corePortalService.findInformacionTitular(
      {
        pais,
        aseguradora,
        proyecto,
        titular,
      },
      i18n.lang,
    );
  }


  @Get('find-documentos-titular')
  async findTitular(
    @Request() req,
    @Query('pais') pais: number,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ) {
    /* return this._proxyExpendienteDigital.send(RMQServices_Expediente.EXPEDIENTE_DIGITAL.findByTitular, {
      session: null,
      pais: pais,
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      lang: i18n.lang,
    }); */
    return this.expArchivoService.GetConfiguracionMasiva({
      session: null,
      pais: pais,
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      lang: i18n.lang,
    });
  }

  /* @Get('find-generacion-formatos')
  async generacion_formatos(
    @Query('folio') folio: string,
    @I18n() i18n: I18nContext,
  ) {
    return this._proxyCore.send(RMQServices_Core.GENERACION_FORMATOS.findOneToEdit, {
      id: folio,
    });
  } */

  @Get('find-validacion-documental')
  async validacion_documental(
    @Query('folio') folio: string,
    @I18n() i18n: I18nContext,
    @Request() req?: any,
  ) {
    /* return this._proxyCore.send(RMQServices_Core.VALIDACION_DIGITAL.findOneToEdit, {
      id: folio,
    }); */
    return await this.flowValidacionDigitalService.findOneToEdit({
      id: folio,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-comentario-by-folio-actividad')
  async findOne(
    @Query('folio') folio: string,
    @Query('actividad') actividad: string,
    @I18n() i18n: I18nContext,
  ) {
    /* return this._proxyCore.send(
          RMQServices_Core.COMENTARIO.find,
          {
              folio,
              actividad,
              lang: i18n.lang,
          }); */
    return await this.coreComentarioService.findOne({
      folio,
      actividad,
      lang: i18n.lang,
    });
  }

  @Get('download-portal')
  async download(
    @Query('fileName') fileName: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ) {
    /* const cliente = await lastValueFrom(
      this._proxyCore.send(
        RMQServices_Core.TITULAR.findOne,
        { titular: titular, lang: i18n.lang },
      ),
    ); */
    // const cliente = await this.coreTitularService.findOne({
    //   titular: titular,
    //   lang: i18n.lang,
    // });
    // const directory = `${this.config.get('AWS_S3_ROOT_DOCUMENTOS')}/${
    //   cliente.numeroCliente
    // }`;
    // const response = await this.serviceFileStorage.downloadBase64(
    //   fileName,
    //   directory,
    // );
    // if (!response) {
    //   return {
    //     success: false,
    //     message: this.i18n.translate('expediente.FILE.ERROR.DOWNLOAD', {
    //       lang: i18n.lang,
    //     }),
    //     data: {},
    //   };
    // }
    // return {
    //   success: true,
    //   data: response,
    // };
  }

  @Post('save-firma-cliente')
  async createFirmaCliente(
    @Body() body: FlowFirmaClienteDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowFirmaClienteService.create({ body, lang: i18n.lang });
  }

  @Get('find-one-to-edit-firma-cliente/:id')
  async findOneToEdit(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Request() req?: any,
  ) {
    return this.corePortalService.findOneToEditFirmaCliente({
      id,
      lang: i18n.lang,
    });
  }

  @Put('firma-cliente/:id')
  async update(
    @Param() id: string,
    @Body() data: FlowFirmaClienteDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.flowFirmaClienteService.update({
      id: id,
      data: data,
      lang: i18n.lang,
    });
  }
}
