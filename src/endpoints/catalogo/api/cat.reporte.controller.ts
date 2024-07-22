import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { CatReporteService } from 'src/modules/catalogo/domain/services/cat.reporte.service';

@Controller(`${SwaggerConsts.CATALOGS.controller}/reporte`)
@ApiTags(SwaggerConsts.CATALOGS.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CatReporteController {
	constructor(private readonly catReporteService: CatReporteService) {}

	@Get('select')
	async select() {
		return await this.catReporteService.select();
	}

	@Get(':id')
	async findOne(
		@Param('id') id: string,
		@I18n() i18n: I18nContext,
	): Promise<ResponseDto> {
		return await this.catReporteService.findOne(id, i18n);
	}
}
