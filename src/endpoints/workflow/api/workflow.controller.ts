import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { WorkflowActividadService } from 'src/modules/workflow/domain/services/workflow.actividad.service';
import { WorkflowConsultaService } from 'src/modules/workflow/domain/services/workflow.consulta.service';
import { WorkflowService } from 'src/modules/workflow/domain/services/workflow.service';
import { WorkflowAvanzarDto } from '../../../modules/workflow/domain/dto/workflow.avanzar.dto';
import { AvanzarWorkflowRequestDto } from '../helpers/avanzar-workflow.request.dto';
import { IniciarWorkflowRequestDto } from '../helpers/iniciar-workflow.request.dto';

@Controller(`${SwaggerConsts.WORKFLOW.controller}`)
@ApiTags(SwaggerConsts.WORKFLOW.tag)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class WorkflowController {
  constructor(
    private readonly workflowService: WorkflowService,
    private readonly workflowActividadService: WorkflowActividadService,
    private readonly workflowConsultaService: WorkflowConsultaService,
  ) {}

  @Post('iniciar-actividad')
  async iniciarActividad(
    @Request() req: any,
    @Body() data: IniciarWorkflowRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const payload = {
      session: req?.user,
      workflow: data,
      lang: i18n.lang,
    };

    return <any>await this.workflowService.iniciar(payload);
  }

  @Post('avanzar-actividad')
  async avanzarActividad(
    @Request() req: any,
    @Body() data: AvanzarWorkflowRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    const payload: WorkflowAvanzarDto = {
      session: req?.user,
      workflow: data,
      lang: i18n.lang,
    };

    return await this.workflowService.avanzar(payload);
  }

  @Post('avanzar-portal')
  async iniciarPortal(
    @Request() req: any,
    @Body() data: AvanzarWorkflowRequestDto,
    @I18n() i18n: I18nContext,
  ) {
    const payload: WorkflowAvanzarDto = {
      session: req?.user,
      workflow: data,
      lang: i18n.lang,
    };

    return <any>await this.workflowService.iniciarPortal(payload); //REVIEW
  }

  @Post('completar-actividad')
  async completarActividad(
    @Request() req: any,
    @Body() data: IniciarWorkflowRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    const payload = {
      session: req?.user,
      workflow: data,
      lang: i18n.lang,
    };
    return <any>await this.workflowService.completar(payload); //REVIEW
  }

  @Get('actividades-by-folio-paginated/:folio/:proyecto')
  async get_actividades_by_folio_paginated(
    @Param('folio') folio: number,
    @Param('proyecto') proyecto: string,
    @Req() params,
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.workflowActividadService.actividadesByFolioPaginated({
      folio: folio,
      proyecto: proyecto,
      paginate: params.paginate,
      lang: i18n.lang,
    });
  }

  @Get('actividades-by-folio')
  async get_actividades_by_folio(
    @Query('folio') folio: number,
    @Query('proyecto') proyecto: string,
  ): Promise<ResponseDto> {
    return await this.workflowConsultaService.actividadesByFolio({
      folio: folio,
      proyecto: proyecto,
    });
  }
}
