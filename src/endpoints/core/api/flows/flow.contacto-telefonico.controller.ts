import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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
import { CatSharedService } from 'src/modules/catalogo/domain/services/_cat.shared.service';
import { FlowContactoTelefonicoUpdateDto } from 'src/modules/core/domain/helpers/dto/flows/flow.contacto-telefonico-update.dto';
import {
  FlowContactoTelefonicoDto,
  FlowInformacionContactoDto,
} from 'src/modules/core/domain/helpers/dto/flows/flow.contacto-telefonico.dto';
import { FlowContactoTelefonicoService } from 'src/modules/core/domain/services/flows/flow.contacto-telefonico.service';
import { FlowContactoTelefonicoComentarioRequestDto, FlowInformacionTelefonicaRequestDto } from '../../helpers/dtos/flows/flow.contacto-telefonico.request.dto';

@Controller(`${SwaggerConsts.CORE.controller}/contacto-telefonico`)
@ApiTags(SwaggerConsts.CORE.children.CONTACTO_TELEFONICO)
@ApiBearerAuth()
@UseGuards(JWTAuthGuard)
export class FlowContactoTelefonicoController {
  constructor(
    private readonly flowContactoTelefonicoService: FlowContactoTelefonicoService,
    private readonly catSharedService: CatSharedService,
  ) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: FlowContactoTelefonicoDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.create({
      body,
      session: req?.user,
      lang: i18n.lang,
    });
  }

  @Post('create-informacion-telefonica')
  async createInformacionTelefonica(
    @Body() body: FlowInformacionTelefonicaRequestDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.createInformacionTelefonica(
      {
        body,
        lang: i18n.lang,
      },
    );
  }

  @Put('informacion-contacto/:id')
  async updateInformacionContacto(
    @Param('id') id: string,
    @Body() body: FlowInformacionContactoDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.updateformacionContacto({
      id,
      body,
      lang: i18n.lang,
    });
  }

  @Post('avanzar-contacto-telefonico')
  async avanzarActividad(
    @Request() req: any,
    @Body() data: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.avanzarActividad({
      session: req?.user,
      workflow: data,
      lang: i18n.lang,
    });
  }

  @Get('find-informacion-telefonica/:id')
  async findInformacionTelefonica(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Req() params,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.findTelefonoCorrespondencia(
      {
        id,
        lang: i18n.lang,
        //paginate: params.paginate,
      },
    );
  }

  @Put('update-to-bandeja-programada/:folio/:actividad')
  async updateToBandejaProgramada(
    @Param('folio') folio: number,
    @Param('actividad') actividad: number,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.updateToBandejaProgramada({
      folio,
      actividad,
      lang: i18n.lang,
      session: req?.user,
    });
  }

  @Put('finaliza-actividad/:folioMultisistema/:folio/:actividad')
  async finalizaActividad(
    @Param('folioMultisistema') folioMultisistema: number,
    @Param('folio') folio: string,
    @Param('actividad') actividad: number,
    @Body() body: FlowContactoTelefonicoComentarioRequestDto,
    @Request() req: any,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.finalizaActividad({
      folioMultisistema,
      folio,
      actividad,
      comentario: body.comentario,
      lang: i18n.lang,
      session: req?.user,
    });
  }

  @Get('find-one-informacion-contacto/:id')
  async findOneInformacionContacto(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Req() params,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.findOneInformacionContacto({
      id,
      lang: i18n.lang,
    });
  }

  @Delete('delete-informacion-telefonica/:id')
  async delete(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
    @Req() params,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.delete({
      id,
      lang: i18n.lang,
    });
  }

  @Get('find-all/:folio')
  async find_all(
    @I18n() i18n: I18nContext,
    @Request() req: any,
    @Param('folio') folio: string,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.findAll({
      lang: i18n.lang,
      paginateParams: req.paginate,
      folio,
    });
  }

  @Get('get-catalogos')
  async findAllOptionSelect(
    @I18n() i18n: I18nContext<I18nTranslations>,
  ): Promise<ResponseDto> {
    return await this.catSharedService.contacto_telefonico_getCatalogos();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.findOne({
      id,
      lang: i18n.lang,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() data: FlowContactoTelefonicoUpdateDto,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.update({
      id,
      data,
      lang: i18n.lang,
    });
  }

  @Get('estatus/:clave')
  async selectFechaProximaLlamadaByEstatus(
    @Param('clave') clave: string,
    @I18n() i18n: I18nContext,
  ): Promise<ResponseDto> {
    return await this.flowContactoTelefonicoService.selectFechaProximaLlamadaByEstatus(
      {
        clave: +clave,
        lang: i18n.lang,
      },
    );
  }
}
