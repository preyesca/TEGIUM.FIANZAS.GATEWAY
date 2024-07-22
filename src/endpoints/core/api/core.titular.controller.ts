import { I18n, I18nContext } from "nestjs-i18n";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Controller, UseGuards, Req, Get, Request } from "@nestjs/common";
import { JWTAuthGuard } from "../../../app/configuration/guards/jwt-auth.guard";
import { SwaggerConsts } from "../../../app/common/consts/swagger.consts";
import { CoreTitularService } from "../../../modules/core/domain/services/core.titular.service";


@Controller(`${SwaggerConsts.CORE.controller}/titular`)
@ApiTags(SwaggerConsts.CORE.children.TITULAR)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class CoreTitularController {

	constructor(private readonly coreTitularService: CoreTitularService) {
	}

	@Get('find-all')
	async find_all(
		@I18n() i18n: I18nContext,
		@Req() params,
	) {
		return await this.coreTitularService.findAll();
	}

	@Get('find-titular-solicitudes')
	async findByProyectoSolicitudes(
		@Request() req: any,
		@I18n() i18n: I18nContext,
		@Req() params) {
		return await this.coreTitularService.findByProyectoSolicitudes({
			lang: i18n.lang,
			session: req?.user,
			paginate: params.paginate,
		});
	}
}