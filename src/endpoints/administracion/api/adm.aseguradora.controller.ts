import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmAseguradoraService } from 'src/modules/administracion/domain/services/adm.aseguradora.service';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { AdmAseguradoraRequestDto } from '../helpers/adm.aseguradora.request.dto';

@Controller(`${SwaggerConsts.ADMINISTRATION.controller}/aseguradora`)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.ASEGURADORA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AdmAseguradoraController {
  constructor(
    private readonly admAseguradoraService: AdmAseguradoraService,
    private readonly catSharedService: CatSharedService,
  ) {}

  @Post()
  async create(
    @Body() body: AdmAseguradoraRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.create({
      data: body,
      lang: i18n.lang,
    });
  }

  @Get('paginate')
  async paginateGetAll(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.paginateAll({
      paginateParams: req?.paginate,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs')
  async getCatalogs(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.catSharedService.aseguradora_getCatalogos();
  }

  @Get('select-all')
  async selectAll(
    @I18n() i18n: I18nContext,
    @Req() params,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findAll({
      paginate: params.paginate,
    });
  }

  @Get('select-all-combo')
  async selectAllCombo(
    @I18n() i18n: I18nContext,
    @Req() params,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findAllCombo({
      lang: i18n.lang,
      paginate: params.paginate,
    });
  }

  @Get('find-one-to-edit/:id')
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-all-option-select')
  async findAllOptionSelect(
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findAllOptionSelect();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findOne({
      id,
      lang: i18n.lang,
    });
  }

  @Get('select-by-pais/:idPais')
  async selectByPais(
    @Param() idPais: string,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.findAllByPais({
      data: idPais,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: AdmAseguradoraRequestDto,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.admAseguradoraService.update({
      id,
      data,
      lang: i18n.lang,
    });
  }
}
