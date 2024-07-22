import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { CatTipoLlamadaService } from 'src/modules/catalogo/domain/services/cat.tipo-llamada.service';

@Controller(`${SwaggerConsts.CATALOGS.controller}/tipo-llamada`)
@ApiTags(SwaggerConsts.CATALOGS.tag)
@ApiBearerAuth()
export class CatTipoLlamadaController {
  constructor(private readonly catTipoLlamadaService: CatTipoLlamadaService) {}

  @Get('select')
  async select() {
    return await this.catTipoLlamadaService.select();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.catTipoLlamadaService.findOne(id, i18n);
  }
}
