import {
  Controller,
  Get,
  Param,
  Req,
  Request,
  UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { CoreBandejaService } from 'src/modules/core/domain/services/core.bandeja.service';

@Controller(`${SwaggerConsts.CORE.controller}/bandeja`)
@ApiTags(SwaggerConsts.CORE.children.BANDEJA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CoreBandejaController {
  constructor(private readonly coreBandejaService: CoreBandejaService) { }


  @Get('entradas')
  async entradas(
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ) {
    return this.coreBandejaService.entradas({
      lang: i18n.lang,
      session: req?.user,
      paginateParams: req?.paginate,
    });
  }

  @Get('busqueda/:showFinalizados')
  async busqueda(
    @Param('showFinalizados') showFinalizados: string,
    @Request() req: any,
    @I18n() i18n: I18nContext
  ) {

    return this.coreBandejaService.busquedas({
      lang: i18n.lang,
      paginateParams: req?.paginate,
      showFinalizados,
      session: req?.user
    });
  }

  @Get('reprocesos')
  async reprocesos(
    @Request() req: any,
    @I18n() i18n: I18nContext) {
    return this.coreBandejaService.reprocesos({
      lang: i18n.lang,
      paginateParams: req?.paginate,
      session: req?.user
    });
  }

  @Get('suspendidas')
  async suspendidas(
    @Request() req: any,
    @I18n() i18n: I18nContext) {
    return this.coreBandejaService.suspendidas({
      lang: i18n.lang,
      paginateParams: req?.paginate,
      session: req?.user
    });
  }

  @Get('programadas')
  async programadas(
    @Request() req: any,
    @I18n() i18n: I18nContext) {
    return this.coreBandejaService.programadas({
      lang: i18n.lang,
      paginateParams: req?.paginate,
      session: req?.user
    });
  }

  @Get('workflow/:folio/:actividad')
  async workflow(
    @Param('folio') folio: string,
    @Param('actividad') actividad: number,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ) {
    return this.coreBandejaService.workflow({
      folio,
      actividad,
      lang: i18n.lang,
      session: req?.user
    });
  }
}
