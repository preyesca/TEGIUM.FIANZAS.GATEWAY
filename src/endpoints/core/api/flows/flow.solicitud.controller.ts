import { Controller, Post, UseGuards, Request, Body, Get, Param } from "@nestjs/common";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { I18n, I18nContext } from "nestjs-i18n";
import { SwaggerConsts } from "src/app/common/consts/swagger.consts";
import { ResponseDto } from "src/app/common/dto/response.dto";
import { JWTAuthGuard } from "src/app/configuration/guards/jwt-auth.guard";
import { FlowSolicitudDTO } from "src/modules/core/domain/helpers/dto/flows/flow.solicitud.dto";
import { FlowSolicitudService } from "src/modules/core/domain/services/flows/flow.solicitud.service";

@Controller(`${SwaggerConsts.CORE.controller}/solicitud`)
@ApiTags(SwaggerConsts.CORE.children.SOLICITUD)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowSolicitudController {

    constructor(
        private readonly solicitudDomain: FlowSolicitudService
    ) { }


    @Post()
    async createOrUpdate(
        @Request() req: any,
        @Body() body: FlowSolicitudDTO,
        @I18n() i18n: I18nContext,
    ): Promise<ResponseDto> {
        return this.solicitudDomain.createOrUpdate({
            body,
            session: req?.user,
            lang: i18n.lang,
        });
    }


    @Get('/:id')
    async findOne(@Param('id') id: string, @I18n() i18n: I18nContext)
        : Promise<ResponseDto> {
        return this.solicitudDomain.findOne({
            id,
            lang: i18n.lang,
        });
    }


    @Get('findby-folio/:folio')
    async findOneByFolio(
        @Param('folio') folio: string,
        @I18n() i18n: I18nContext,
    ): Promise<ResponseDto> {
        return this.solicitudDomain.findOneByFolio({
            folio,
            lang: i18n.lang,
        });
    }


    @Post('avanzar-solicitud')
    async avanzarActividad(@Request() req: any, @Body() data: any, @I18n() i18n: I18nContext): Promise<ResponseDto> {
        const payload = {
            session: req?.user,
            workflow: data,
            bearer: req?.headers['authorization'],
            i18nContext: i18n
        }
        return this.solicitudDomain.avanzar(payload)
    }


    @Post('reenviar-formatos-firmados-solicitud')
    async reenviarFormatosFirmadosSolicitud(@Request() req: any, @Body() data: any, @I18n() i18n: I18nContext): Promise<ResponseDto> {
        const payload = {
            session: req?.user,
            workflow: data,
            bearer: req?.headers['authorization'],
            i18nContext: i18n
        }
        return this.solicitudDomain.reenviarFormatosFirmados(payload)
    }

    @Post('notificacion-no-continua-proceso')
    async notificacionNoContinuaProceso(@Request() req: any, @Body() data: any, @I18n() i18n: I18nContext): Promise<ResponseDto> {
        const payload = {
            session: req?.user,
            workflow: data,
            bearer: req?.headers['authorization'],
            i18nContext: i18n
        }
        return this.solicitudDomain.noContinuaProceso(payload)
    }


}