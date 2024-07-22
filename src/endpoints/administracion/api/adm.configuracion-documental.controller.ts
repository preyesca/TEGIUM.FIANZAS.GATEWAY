import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmConfiguracionDocumentalService } from 'src/modules/administracion/domain/services/adm.configuracion-documental.service';
import { AdmConfiguracionDocumentalRequestDto } from '../helpers/adm.configuracion-documental.request.dto';

@Controller(
  `${SwaggerConsts.ADMINISTRATION.controller}/configuracion-documental`,
)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.CONFIGURACION_DOCUMENTAL)
export class AdmConfiguracionDocumentalController {
  constructor(
    private readonly admConfiguracionDocumentalService: AdmConfiguracionDocumentalService,
  ) {}

  @Post()
  async create(
    @Body() body: AdmConfiguracionDocumentalRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.create({
      body: <any>{ ...body }, //REVIEW,
      lang: i18n.lang,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Get('paginate')
  async paginate(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.paginateAll({
      paginateParams: req?.paginate,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCatalogs(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.getCatalogosToCreate({
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-one-to-edit/:id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-configuracion-documental-masiva')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getConfiguracionDocumentalMasiva(
    @Request() req: any,
    @Query('proyecto') proyecto: string,
    @Query('aseguradora') aseguradora: string,
    @Query('titular') titular: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.getConfiguracionDocumental(
      {
        proyecto: proyecto,
        aseguradora: aseguradora,
        titular: titular,
        lang: i18n.lang,
      },
    );
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() data: AdmConfiguracionDocumentalRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admConfiguracionDocumentalService.update({
      id: id,
      data: <any>{ ...data },
      lang: i18n.lang,
    });
  }
}
