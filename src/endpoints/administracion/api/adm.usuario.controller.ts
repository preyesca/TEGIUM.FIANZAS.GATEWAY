import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { AdmContrasenaRequestDto } from '../helpers/adm.contrasena.request.dto';
import { AdmRecoverPasswordRequestDto } from '../helpers/adm.recover-password.request.dto';
import { AdmUpdateClaveRequestDto } from '../helpers/adm.update-clave.request.dto';
import {
  AdmUsuarioRequestDto,
  AdmUsuarioUpdateRequestDto,
} from '../helpers/adm.usuario.request.dto';

export const IS_PUBLIC_KEY = 'isPublic';
export const AllowAnonymous = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller(`${SwaggerConsts.ADMINISTRATION.controller}/usuario`)
@ApiTags(SwaggerConsts.USUARIO.tag)
export class AdmUsuarioController {
  constructor(private readonly admUsuarioService: AdmUsuarioService) { }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async create(
    @Body() body: AdmUsuarioRequestDto,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admUsuarioService.create({
      body: { ...body, estatus: 0 },
      session: req?.user,
      bearer: req?.headers['authorization'],
      i18nContext: i18n
    });
  }

  @AllowAnonymous()
  @Post('activate-account/:id')
  async activateAccount(
    @Param('id') id: string,
    @Body() body: AdmContrasenaRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admUsuarioService.activateAccount({
      id,
      body,
      lang: i18n.lang,
    });
  }

  @AllowAnonymous()
  @Post('recover-password')
  async recoverPassword(
    @Body() body: AdmRecoverPasswordRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admUsuarioService.recoverPassword({
      body,
      i18nContext: i18n,
    });
  }

  @Get('paginate')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async paginateGetAll(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admUsuarioService.paginateAll({
      paginateParams: req?.paginate,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-all')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findAll(@I18n() i18n: I18nContext): Promise<ResponseDto> {
    return await this.admUsuarioService.findAll(i18n);
  }

  @AllowAnonymous()
  @Get('find-name/:id')
  async findName(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.admUsuarioService.findName({
      id,
      lang: i18n.lang,
    });
  }

  @Get('get-catalogs')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async getCatalogs(@Request() req: any, @I18n() i18n: I18nContext) {
    return await this.admUsuarioService.getCatalogosToCreate({
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
  ) {
    return await this.admUsuarioService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.admUsuarioService.findOne({
      id,
      lang: i18n.lang,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Put('update-password/:id')
  async updatePassword(
    @Param('id') id: string,
    @Body() body: AdmContrasenaRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.admUsuarioService.updatePassword({
      id,
      body,
      lang: i18n.lang,
    });
  }

  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  @Put('update-clave/:id')
  async updateClave(
    @Param('id') id: string,
    @Body() body: AdmUpdateClaveRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.admUsuarioService.updateClave({
      id,
      body,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: AdmUsuarioUpdateRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.admUsuarioService.update({
      id,
      body,
      lang: i18n.lang,
    });
  }
}
