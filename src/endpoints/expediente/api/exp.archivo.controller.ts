import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
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
import { AdmDocumentoService } from 'src/modules/administracion/domain/services/adm.documento.service';
import { CoreTitularService } from 'src/modules/core/domain/services/core.titular.service';
import { ExpArchivoDto } from 'src/modules/expediente/domain/helpers/dto/exp.archivo.dto';
import { ExpArchivoService } from 'src/modules/expediente/domain/services/exp.archivo.service';
import { ExpArchivoRequestDto } from '../helpers/exp.archivo.request.dto';

@Controller(`${SwaggerConsts.EXPEDIENTE.controller}/archivos`)
@ApiTags(SwaggerConsts.EXPEDIENTE.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class ExpArchivoController {
  constructor(
    private i18nService: I18nService<I18nTranslations>,
    private readonly expArchivoService: ExpArchivoService,
    private readonly admDocumentoService: AdmDocumentoService,
    private readonly coreTitularService: CoreTitularService,
    private readonly fileStorageService: FileStorageService,
  ) { }

  @Post('cotejar-o-descotejar-documentos')
  async cotejarODescotejarDocumentos(
    @Body() data: any,
    @I18n() i18n: I18nContext
  ): Promise<any> {
    return await this.expArchivoService.cotejarODescotejar({
      data,
      lang: i18n.lang
    })
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async create(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: ExpArchivoRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    if (!HelperFileValidator.isValid(file))
      return DefaultResponse.sendBadRequest('all.VALIDACIONES.FILE_INVALID');

    const documentoResult = await this.admDocumentoService.selectOne(
      body.documento.toString(),
    );

    if (!documentoResult.success) return documentoResult;

    const documento = documentoResult.data;

    if (documento === null) {
      return DefaultResponse.sendNotFound(
        this.i18nService.translate('all.VALIDATIONS.DATA.NOT_FOUND.GENERAL', {
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

    body.usuarioAlta = req?.user.usuario;
    body.version = version ?? 1;
    body.nombreCorto = `${nombreBase}_v${body.version}${extension}`;
    body.contentType = file.mimetype;
    body.archivoSize = file.size;

    const storageResponse = await this.fileStorageService.upload(
      EProceso.FIANZAS,
      EStorageFolder.EXPEDIENTES,
      i18n.lang,
      file,
      `${cliente.numeroCliente}{sep}${body.nombreCorto}`,
    );

    if (!storageResponse.success) {
      return DefaultResponse.sendConflict(
        this.i18nService.translate('expediente.FILE.ERROR.SAVE', {
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
      mimetype: expediente.contentType,
      clave: documento.clave,
      archivoSize: file.size,
    } as ExpArchivoDto;


    return expedienteResult;
  }

  @Get('check-by-titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async check_documentacion(
    @Request() req,
    @Query('pais') pais: string,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.expArchivoService.GetConfiguracionMasiva({
      session: null,
      pais: Number(pais),
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      lang: i18n.lang,
    });
  }

  @Get('find-by-titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findTitular(
    @Request() req,
    @Query('pais') pais: number,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.expArchivoService.findTitular({
      session: req?.user,
      pais: pais,
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      lang: i18n.lang,
    });
  }

  @Get('find-by-titular-paginated/:pais/:aseguradora/:proyecto/:titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findTitularPaginated(
    @Param('pais') pais: number,
    @Param('aseguradora') aseguradora: string,
    @Param('proyecto') proyecto: string,
    @Param('titular') titular: string,
    @Req() params,
    @I18n() i18n: I18nContext,
  ) {
    return await this.expArchivoService.findTitularPaginated(
      pais,
      aseguradora,
      proyecto,
      titular,
      i18n,
      params.paginate,
    );
  }

  @Get('find-by-titular-cotejo-paginated')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findTitularCotejoPaginated(
    @Request() req,
    @Query('pais') pais: number,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @Query('limit') limit: number,
    @Req() params,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.expArchivoService.findTitularCotejoPaginated({
      session: req?.user,
      pais: pais,
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      lang: i18n.lang,
      paginate: params.paginate,
    });
  }

  // @Get('download')
  // async download(
  //   @Query('fileName') fileName: string,
  //   @Query('titular') titular: string,
  //   @I18n() i18n: I18nContext,
  // ) {
  //   const cliente: any = null;
  //   // = await lastValueFrom(
  //   //   this._clientProxyCore.send(
  //   //     RMQServices_Core.TITULAR.findOne,
  //   //     { titular: titular, lang: i18n.lang },
  //   //   ),
  //   // );

  //   const response = await this.fileStorageService.downloadBase64(
  //     i18n.lang,
  //     '',
  //   );

  //   if (!response) {
  //     return {
  //       success: false,
  //       message: this.i18nService.translate('expediente.FILE.ERROR.DOWNLOAD', {
  //         lang: i18n.lang,
  //       }),
  //       data: {},
  //     };
  //   }

  //   return {
  //     success: true,
  //     data: response,
  //   };
  // }

  // @Get('find-all')
  // async find_all(@I18n() i18n: I18nContext) {
  //   return this._proxyExpendienteDigital.send('SELECT_ALL_ARCHIVOS', {
  //     lang: i18n.lang,
  //   });
  // }

  @Get('getAllTitularesSelect')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCatalogostTitularesByProyecto(
    @Request() req,
    @I18n() i18n: I18nContext,
  ) {
    return await this.expArchivoService.GetCatalogostTitularesByProyecto({
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('getByTitularAndTypeDocument')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getByTitularAndTypeDocument(
    @Request() req,
    @I18n() i18n: I18nContext,
    @Query('pais') pais: number,
    @Query('aseguradora') aseguradora: string,
    @Query('proyecto') proyecto: string,
    @Query('titular') titular: string,
    @Query('idDocument') idDocument: string,
  ) {
    return await this.expArchivoService.findByTitularAndTypeDocument({
      session: req?.user,
      pais: pais,
      aseguradora: aseguradora,
      proyecto: proyecto,
      titular: titular,
      idDocument: idDocument,
      lang: i18n.lang,
    });
  }

  @Get('find-Cotejo/:id')
  async findOneCotejo(@Param('id') id: string, @Param('path') path: string, @I18n() i18n: I18nContext) {
    const responseExpediente = await this.expArchivoService.selectOne(id);
    if (!responseExpediente.data) {
      return {
        success: false,
        message: this.i18nService.translate('expediente.FILE.ERROR.NOT_FOUND'),
        data: {},
      };
    }
    const expediente = responseExpediente.data;
    const response = await this.fileStorageService.downloadBase64(
      i18n.lang,
      expediente.cotejado?.path,
      "application/pdf"
    );
    if (!response) {
      return {
        success: false,
        message: this.i18nService.translate('expediente.FILE.ERROR.DOWNLOAD'),
        data: {},
      };
    }
    return DefaultResponse.sendOk('', response.data);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const expedienteResult = await this.expArchivoService.selectOne(id);

    if (!expedienteResult.success) return expedienteResult;

    const expediente = expedienteResult.data;

    const response = await this.fileStorageService.downloadBase64(
      i18n.lang,
      expediente.url,
      expediente.contentType,
    );

    if (!response)
      return DefaultResponse.sendInternalError(
        this.i18nService.translate('expediente.FILE.ERROR.DOWNLOAD', {
          lang: i18n.lang,
        }),
      );

    return DefaultResponse.sendOk('', response.data);
  }

  // @Post('find-detail')
  // async detail(@Body() data: any, @I18n() i18n: I18nContext) {
  //
  //   return this._proxyExpendienteDigital.send('FIND_ARCHIVOS_DETAIL', data);
  // }

  // @Get('getAllDocumentosSelect/:id')
  // getCatalogosDocumentosByPais(@Param('id') id: string) {
  //   return await this.expArchivoService.findSeleccionados(data);
  //   return this._proxyExpendienteDigital.send(
  //     'CARGA_DOCUMENTAL_MASIVA_DOCUMENTOS_BY_PAIS',
  //     { pais: id },
  //   );
  // }

  @Delete(':id')
  async delete(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.expArchivoService.delete({
      id: id,
    });
  }

  @Put('updateEnviado/:id/:seleccionado')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async update(@Param() params: string, @Request() req) {
    return await this.expArchivoService.updateEnviado({
      session: req.user,
      data: params,
    });
  }

  @Get('get-seleccionados/:titular')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async GetSeleccionados(@Param() params: any) {
    const data = {
      titular: params.titular,
    };
    return await this.expArchivoService.findSeleccionados(data);
  }
}
