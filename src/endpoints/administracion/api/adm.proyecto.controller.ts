import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmProyectoService } from 'src/modules/administracion/domain/services/adm.proyecto.service';
import { AdmProyectoRequestDto } from '../helpers/adm.proyecto.request.dto';

@Controller(`${SwaggerConsts.ADMINISTRATION.controller}/proyecto`)
@ApiTags(SwaggerConsts.ADMINISTRATION.children.PROYECTO)
export class AdmProyectoController {
  constructor(private readonly admProyectoService: AdmProyectoService) {}

  @Post()
  async create(
    @Body() body: AdmProyectoRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.create({
      body: { ...body }, //REVIEW
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
    return await this.admProyectoService.paginate({
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
    return await this.admProyectoService.getCatalogosToCreate({
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-all-by-pais/:pais')
  async findAllByPais(
    @Param('pais') pais: number,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.findAllCodigosByPais({
      pais,
      lang: i18n.lang,
    });
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.findOne({
      id,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs-pais/:id')
  async getCatalogsAdministracion(
    @Param('id') id: string,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.getCatalogosByPais(id);
  }

  @Get('find-one-to-edit/:id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param() id: string,
    @Body() body: AdmProyectoRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admProyectoService.update({
      id,
      data: { ...body }, //REVIEW
      lang: i18n.lang,
    });
  }
}
