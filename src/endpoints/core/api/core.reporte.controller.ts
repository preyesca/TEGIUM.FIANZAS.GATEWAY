import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { AdmUsuarioService } from 'src/modules/administracion/domain/services/adm.usuario.service';
import { CoreReporteService } from 'src/modules/core/domain/services/core.reporte.service';
import { CoreReporteRequestDto } from '../helpers/dtos/core.reporte.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/reporte`)
@ApiTags(SwaggerConsts.CORE.children.TITULAR)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CoreReporteController {
  constructor(
    private readonly admUsuarioService: AdmUsuarioService,
    private readonly coreReporteService: CoreReporteService,
  ) {}

  @Post()
  async sendReport(
    @Request() req,
    @I18n() i18n: I18nContext,
    @Body() data: CoreReporteRequestDto,
  ): Promise<ResponseDto> {
    const resultUser = await this.admUsuarioService.findOne({
      id: req.user.usuario,
      lang: i18n.lang,
    });
    data.destinatarios.push(resultUser.data.correoElectronico);
    return await this.coreReporteService.create(data, i18n);
  }
}
