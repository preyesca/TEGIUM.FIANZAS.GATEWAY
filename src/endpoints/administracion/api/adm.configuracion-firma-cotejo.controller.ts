import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { EStorageFolder } from 'src/app/common/enum/catalogo/directory.enum';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FileStorageService } from 'src/app/services/shared/file-storage.service';
import {
  AddConfigFirmaCotejoDto,
  AdmConfiguracionFirmaCotejoDto,
} from 'src/modules/administracion/domain/dto/adm.configuracion-firma-cotejo.dto';
import { AdmConfiguracionFirmaCotejoService } from 'src/modules/administracion/domain/services/adm.configuracion-firma-cotejo.service';

@Controller(
  `${SwaggerConsts.ADMINISTRATION.controller}/configurador-firma-cotejo`,
)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.CONFIGURACION_DE_FIRMA_COTEJO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AdmConfiguracionFirmaCotejoController {
  constructor(
    private readonly firmaCotejoService: AdmConfiguracionFirmaCotejoService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Get('paginate')
  async paginate(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.firmaCotejoService.paginate({
      paginateParams: req?.paginate,
      lang: i18n.lang,
    });
  }

  @Get('select-all')
  async selectAll(@I18n() i18n: I18nContext): Promise<ResponseDto> {
    return await this.firmaCotejoService.selectAll();
  }

  @Get('select-by-id/:id')
  async selectById(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.firmaCotejoService.selectById({
      id: id,
      lang: i18n.lang,
    });
  }

  @Get('find-ejecutivo-by-clave/:id')
  async selectByClave(
    @Param('id') id: string,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.firmaCotejoService.findEjecutivoByClave({
      data: {
        proyecto: req?.user.proyecto,
        clave: id,
      },
      lang: i18n.lang,
    });
  }

  @Get('select-by-proyecto/:id')
  async selectByProyecto(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.firmaCotejoService.selectByProyecto({
      proyecto: id,
      lang: i18n.lang,
    });
  }

  @Post()
  @UseInterceptors(FilesInterceptor('firmas'))
  async addConfiguracion(
    @UploadedFiles() firmas: Array<Express.Multer.File>,
    @Body('data') data: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const info = JSON.parse(data) as AdmConfiguracionFirmaCotejoDto;
    const resp = await Promise.all(
      firmas.map((firma, i) =>
        this.fileStorageService.upload(
          EProceso.FIANZAS,
          EStorageFolder.FIRMAS_DE_EJECUTIVOS,
          i18n.lang,
          firma,
          `${info.ejecutivos[i].firma}`,
        ),
      ),
    );

    const test = resp.find((r) => r.success == false);
    if (test) return test;

    firmas.forEach(async (element, index) => {
      info.ejecutivos[index] = {
        ...info.ejecutivos[index],
        path: resp[index].data,
        clave: Number(info.ejecutivos[index].clave),
        contentType: element.mimetype,
        originalName: element.originalname,
      };
    });

    return this.firmaCotejoService.create({ data: info, lang: i18n.lang });
  }

  @Get('download-firma')
  async downloadFirma(
    @Query() query,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const firmasInfo = await this.firmaCotejoService.selectAll();

    const ejecutivo = firmasInfo.data[0].ejecutivos.find(
      (f) => f.clave == query.clave,
    );

    const fileResponse = await this.fileStorageService.downloadBase64(
      i18n.lang,
      ejecutivo.path,
      ejecutivo.contentType,
    );

    if (!fileResponse.success) return fileResponse;

    return DefaultResponse.sendOk('', fileResponse.data);
  }

  @Get('delete-firma')
  async deleteFirma(
    @Query() query,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return this.firmaCotejoService.deleteFirma({
      data: { proyecto: query.proyecto, idFirma: query.idFirma },
      lang: i18n.lang,
    });
  }

  @Post('add-ejecutivo')
  @UseInterceptors(FileInterceptor('file'))
  async addEjecutivo(
    @UploadedFile() file: Express.Multer.File,
    @Body() data: AddConfigFirmaCotejoDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const upload = await Promise.all([
      this.fileStorageService.upload(
        EProceso.FIANZAS,
        EStorageFolder.FIRMAS_DE_EJECUTIVOS,
        i18n.lang,
        file,
        data.firma,
      ),
    ]);

    if (!upload[0].success) return upload[0];

    data = {
      ...data,
      path: upload[0].data,
      clave: Number(data.clave),
      contentType: file.mimetype,
      originalName: file.originalname,
    };

    return this.firmaCotejoService.update({ data, lang: i18n.lang });
  }
}
