import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { CatEstatusGeneralService } from 'src/modules/catalogo/domain/services/cat.estatus-general.service';

@Controller(`${SwaggerConsts.CATALOGS.controller}/estatus-general`)
@ApiTags(SwaggerConsts.CATALOGS.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CatEstatusGeneralController {
  constructor(
    private readonly catEstatusGeneralService: CatEstatusGeneralService,
  ) {}

  @Get('select')
  async select() {
    return await this.catEstatusGeneralService.select();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.catEstatusGeneralService.findOne(id, i18n);
  }
}
