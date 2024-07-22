import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { CatPaisService } from 'src/modules/catalogo/domain/services/cat.pais.service';

@Controller(`${SwaggerConsts.CATALOGS.controller}/pais`)
@ApiTags(SwaggerConsts.CATALOGS.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CatPaisController {
  constructor(private readonly catPaisService: CatPaisService) {}

  @Get('select')
  async select(): Promise<ResponseDto> {
    //return this._clientProxyCatalogo.send(RMQServices_Catalogo.PAIS.select, {});
    return await this.catPaisService.select();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.catPaisService.findOne(id, i18n);
    //return this._clientProxyCatalogo.send(RMQServices_Catalogo.PAIS.finOne, id);
  }
}
