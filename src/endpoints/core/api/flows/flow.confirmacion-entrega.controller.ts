import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { SwaggerConsts } from 'src/app/common/consts/swagger.consts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { JWTAuthGuard } from 'src/app/configuration/guards/jwt-auth.guard';
import { FlowConfirmacionEntregaService } from 'src/modules/core/domain/services/flows/flow.confirmacion-entrega.service';
import { FlowConfirmacionEntregaRequestDto } from '../../helpers/dtos/flows/flow.confirmacion-entrega.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/confirmacion-entrega`)
@ApiTags(SwaggerConsts.CORE.children.CONFIRMACION_ENTREGA)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowConfirmacionEntregaController {
  constructor(
    private readonly flowConfirmacionEntregaService: FlowConfirmacionEntregaService,
  ) { }

  @Post()
  async create(
    @Body() body: FlowConfirmacionEntregaRequestDto,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowConfirmacionEntregaService.create({
      body,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Get('find-one-to-edit/:id')
  @ApiBearerAuth()
  @UseGuards(JWTAuthGuard)
  async findOneToEdit(
    @Request() req: any,
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowConfirmacionEntregaService.findOneToEdit({
      id,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param() id: any,
    @Body() data: FlowConfirmacionEntregaRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowConfirmacionEntregaService.update({
      id,
      data,
      lang: i18n.lang,
    });
  }
}
