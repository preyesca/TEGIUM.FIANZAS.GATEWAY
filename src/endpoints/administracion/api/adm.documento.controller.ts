import { Controller, Get, Request, UseGuards, Post, Body, Param, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AdmDocumentoDto } from 'src/modules/administracion/domain/dto/adm.documento.dto';
import { AdmDocumentoService } from 'src/modules/administracion/domain/services/adm.documento.service';
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';

@Controller(`${SwaggerConsts.ADMINISTRATION.controller}/documento`)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.DOCUMENTO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class AdmDocumentoController {
  constructor(
    private readonly admDocumentoService: AdmDocumentoService,
    private readonly catSharedService: CatSharedService
  ) {}

  @Post()
  async create(@Body() data: AdmDocumentoDto, @I18n() i18n: I18nContext) {
    return await this.admDocumentoService.create({
      data,
      lang: i18n.lang,
    });
  }

  @Get('find-all-option-select')
  async findAllOptionSelect(@I18n() i18n: I18nContext<I18nTranslations>) {
    return await this.admDocumentoService.findAllOptionSelect({
      lang: i18n.lang,
    });
  }

  @Get('paginate')
  async find_all(@Request() req: any, @I18n() i18n: I18nContext) {
    return await this.admDocumentoService.paginateAll(req?.paginate, i18n.lang);
  }

  @Get('get-catalogs')
  async getCatalogs(@Request() req: any, @I18n() i18n: I18nContext) {
    return await this.catSharedService.documento_getCatalogos();
  }

  @Get('find-all')
  async paginateGetAll(@I18n() i18n: I18nContext) {
    return await this.admDocumentoService.findAll(i18n.lang);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.admDocumentoService.selectOne(id);
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: AdmDocumentoDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.admDocumentoService.update({ id, data, lang: i18n.lang });
  }

  @Get('find-one-to-edit/:id')
  async findOneToEdit(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.admDocumentoService.findOneToEdit({
      id,
      lang: i18n.lang,
    });
  }
  @Get('find-by-clave/:clave')
  async findByClave(@Param('clave') clave: string, @I18n() i18n: I18nContext) {
	  return await this.admDocumentoService.findByClave({clave,lang:i18n.lang})
  }
}
