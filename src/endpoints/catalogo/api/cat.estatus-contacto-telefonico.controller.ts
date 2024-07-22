import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { CatEstatusContactoTelefonicoService } from 'src/modules/catalogo/domain/services/cat.estatus-contacto-telefonico.service';

@Controller(`${SwaggerConsts.CATALOGS.controller}/estatus-contacto-telefonico`)
@ApiTags(SwaggerConsts.CATALOGS.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CatEstatusContactoTelefonicoController {
  constructor(
    private readonly catEstatusContactoTelefonicoService: CatEstatusContactoTelefonicoService,
  ) {}

  @Get('select')
  async select() {
    return await this.catEstatusContactoTelefonicoService.select();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.catEstatusContactoTelefonicoService.findOne(id, i18n);
  }
}
