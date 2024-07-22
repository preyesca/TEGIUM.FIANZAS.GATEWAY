import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { BitActividadService } from 'src/modules/bitacora/domain/services/bit.actividad.service';
import { BitActividadDto } from '../helpers/bit.actividad.request.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { Types } from 'mongoose';

@Controller(`${SwaggerConsts.BITACORA.controller}/actividad`)
@ApiTags(SwaggerConsts.BITACORA.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class BitActividadController {
  constructor(private readonly bitBitacoraService: BitActividadService) {}


  @Post()
  async create(@Body() data: BitActividadDto, @I18n() i18n: I18nContext) {
    return await this.bitBitacoraService.create({
      data,
      lang: i18n.lang,
    });
  }

  @Get('select-by-folio/:idFolio')
  async selectByPais(
    @Param('idFolio') idFolio: string,
    @Req() params,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ) {
    return await this.bitBitacoraService.selectByFolio({
      idFolio,
      lang: i18n.lang,
      paginate: params.paginate,
    });
  }

  @Get('select-by-folio-for-detalle/:idFolio')
  async selectByFolioForDetalle(@Param("idFolio") idFolio: Types.ObjectId, @Req() params, @I18n() i18n: I18nContext<I18nTranslations>) {
      return this.bitBitacoraService.selectByFolioForDetalle({ data: idFolio, lang: i18n.lang, paginate: params.paginate })
  }

}
