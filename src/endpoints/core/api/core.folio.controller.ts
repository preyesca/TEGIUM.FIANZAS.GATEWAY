import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { SessionTokenDto } from 'src/app/common/dto/session-token.dto';
import { EStorageFolder } from 'src/app/common/enum/catalogo/directory.enum';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';
import { FileStorageService } from 'src/app/services/shared/file-storage.service';
import * as xlsx from 'xlsx';
import { SwaggerConsts } from '../../../app/common/consts/swagger.consts';
import { ECatalogo } from '../../../app/common/enum/catalogo.enum';
import { DefaultResponse } from '../../../app/common/response/default.response';
import { JWTAuthGuard } from '../../../app/configuration/guards/jwt-auth.guard';
import { HelperFileValidator } from '../../../app/utils/validators/file.validator';
import { CoreFolioLayoutDetailBodyColumnDto } from '../../../modules/core/domain/helpers/dto/core.folio-layout.dto';
import { ELayoutColumnType } from '../../../modules/core/domain/helpers/enum/core.layout-column-type.enum';
import { CoreFolioLayoutService } from '../../../modules/core/domain/services/core.folio-layout.service';
import { CoreFolioService } from '../../../modules/core/domain/services/core.folio.service';

@Controller(`${SwaggerConsts.CORE.controller}/folio`)
@ApiTags(SwaggerConsts.CORE.children.FOLIO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CoreFolioController {
  constructor(
    private readonly fileStorageService: FileStorageService,
    private readonly coreFolioLayoutService: CoreFolioLayoutService,
    private readonly coreFolioService: CoreFolioService,
  ) { }

  @Get('find-one/:id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreFolioService.findOne({ id, lang: i18n.lang });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const fechaInicioCarga = Date.now();
    const session = <SessionTokenDto>req?.user;

    if (!HelperFileValidator.isValid(file))
      return DefaultResponse.sendBadRequest('El archivo es requerido');

    if (!HelperFileValidator.isAllowedFile(file.originalname, ['xls', 'xlsx']))
      return DefaultResponse.sendBadRequest(
        'Solo se permiten archivos XLS o XLSX',
      );

    const workbook = xlsx.read(file.buffer, {
      type: 'buffer',
      cellDates: true,
      cellText: true,
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows: any[] = xlsx.utils.sheet_to_json(worksheet, {
      defval: null,
      dateNF: 'dd/MM/yyyy',
    });

    if (rows.length < 1)
      return DefaultResponse.sendBadRequest(
        'El layout no contiene información',
      );

    if (Object.keys(rows[0]).length !== 17)
      return DefaultResponse.sendBadRequest(
        'El layout no contiene las columnas requeridas',
      );

    const layoutHeaderResult =
      await this.coreFolioLayoutService.createLayoutHeader(
        {
          filename: file.originalname,
          originalFilename: file.originalname,
          contentType: file.mimetype,
          archivoSize: file.size,
          totalRows: rows.length,
          fechaInicioCarga: new Date(fechaInicioCarga),
        },
        req?.user,
        i18n,
      );

    if (!layoutHeaderResult.success) return layoutHeaderResult;

    const { layoutHeaderId, filename, perfil } = layoutHeaderResult.data;

    const uploadResponse = await this.fileStorageService.upload(
      EProceso.FIANZAS,
      EStorageFolder.CARGAS_MASIVAS,
      i18n.lang,
      file,
      `${session.usuario}{sep}${perfil}{sep}${filename}`,
    );

    if (!uploadResponse.success) return uploadResponse;

    this.processLayout(layoutHeaderId, rows, req, fechaInicioCarga, i18n);

    return DefaultResponse.sendOk(
      'Su archivo se está procesando. Recibirá un correo electrónico con el resultado una vez finalizado.',
    );
  }

  private async processLayout(
    layoutHeaderId: string,
    rows: any,
    req: any,
    fechaInicioCarga: number,
    i18nContext: I18nContext,
  ): Promise<void> {
    const columns: CoreFolioLayoutDetailBodyColumnDto[] = [
      {
        order: 0,
        name: 'CLIENTE',
        type: ELayoutColumnType.NUMERIC,
        required: true,
      },
      {
        order: 1,
        name: 'NOM_CLIENTE',
        type: ELayoutColumnType.ALPHANUMERIC,
        required: true,
      },
      {
        order: 2,
        name: 'CVE_EJECUTIVO',
        type: ELayoutColumnType.ALPHANUMERIC,
        required: true,
      },
      {
        order: 3,
        name: 'NOM_EJECUTIVO',
        type: ELayoutColumnType.ALPHANUMERIC,
        required: true,
      },
      {
        order: 4,
        name: 'UNIDAD',
        type: ELayoutColumnType.ALPHANUMERIC,
        required: true,
      },
      {
        order: 5,
        name: 'DES_UNIDAD',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.UNIDAD,
        required: true,
      },
      {
        order: 6,
        name: 'NOM_RIESGO',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.RIESGO,
        required: true,
      },
      {
        order: 7,
        name: 'CONTACTO_CORRESPONDECIA',
        type: ELayoutColumnType.ALPHANUMERIC,
        required: true,
      },
      {
        order: 8,
        name: 'EMAIL_CORRESPONDECIA',
        type: ELayoutColumnType.EMAIL_MULTIPLE_WITH_SEPARATOR,
        separator: ',',
        required: true,
      },
      {
        order: 9,
        name: 'TELEFONO_CORRESPONDENCIA',
        type: ELayoutColumnType.TELEFONO_CORRESPONDENCIA,
        required: true,
      },
      {
        order: 10,
        name: 'TIPO CONTACTO',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.TIPO_CONTACTO,
        required: true,
      },
      {
        order: 11,
        name: 'ASEGURADORA',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.ASEGURADORA,
        required: true,
      },
      {
        order: 12,
        name: 'OFICINA',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.OFICINA,
        required: true,
      },
      {
        order: 13,
        name: 'FECHA VIGENCIA',
        type: ELayoutColumnType.DATE_WITH_FORMAT,
        format: 'dd/MM/yyyy',
        required: true,
      },
      {
        order: 14,
        name: 'TIPO MOVIMIENTO',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.TIPO_MOVIMIENTO,
        required: true,
      },
      {
        order: 15,
        name: 'TIPO PERSONA',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.TIPO_PERSONA,
        required: true,
      },
      {
        order: 16,
        name: 'GIRO',
        type: ELayoutColumnType.CATALOG,
        catalog: ECatalogo.GIRO,
        required: true,
      },
    ];

    const blockSize = 1000;

    let index: number = 0;
    let blockIndex: number = 0;
    let layoutWithErrors: boolean = false;

    while (index < rows.length) {
      const dataBlock = rows.slice(index, index + blockSize);

      const result: any = await this.coreFolioLayoutService.uploadLayoutDetails(
        {
          body: {
            header: layoutHeaderId,
            block: blockIndex,
            rowIndex: index,
            columns,
            data: dataBlock,
          },
          session: req?.user,
          lang: i18nContext.lang,
        },
      );

      if (!layoutWithErrors && result.data.layoutWithErrors)
        layoutWithErrors = true;

      index += blockSize;
      blockIndex += 1;

      if (index >= rows.length) {
        await this.coreFolioLayoutService.updateLayoutHeader({
          body: {
            _id: layoutHeaderId,
            correcto: layoutWithErrors,
            fechaInicioCarga,
          },
          session: req?.user,
          bearer: req?.headers['authorization'],
          i18nContext: i18nContext,
        });
      }
    }
  }

  @Get('paginateLayouts')
  async paginateLayouts(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreFolioLayoutService.paginateLayoutsByUser({
      paginateParams: req?.paginate,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-layout/:header')
  async findOneLayoutByKey(
    @Param('header') header: string,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreFolioLayoutService.findOneByHeader({
      header,
      paginateParams: req?.paginate,
      lang: i18n.lang,
    });
  }

  @Get('info-general/:folio')
  async getInfoGeneralByFolio(
    @Param('folio') folio: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.coreFolioService.getInfoGeneralByFolio({
      folio,
      lang: i18n.lang,
    });
  }
}
