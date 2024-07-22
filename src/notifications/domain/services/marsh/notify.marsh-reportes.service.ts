import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { NotifyMailService } from '../notify.mail.service';
import { NotifyMarshReporteSeguimientooDto } from '../../helpers/dto/repotes/reporte.seguimiento.dto';
import { FnzTemplatesConsts } from '../../helpers/consts/fnz.templates.consts';

@Injectable()
export class NotifyMarshReportesService {
  private readonly _templateRoot: string = join('fianzas', 'reportes');

  constructor(
    private i18nService: I18nService<I18nTranslations>,
    private notifyMailService: NotifyMailService,
  ) {}

  async seguimiento(
    i18n: I18nContext,
    body: NotifyMarshReporteSeguimientooDto,
  ): Promise<ResponseDto> {
    const replacement = {
      fechaInicio: body.fechaInicio,
      fechaFin: body.fechaInicio,
    };

    const template: string = join(
      this._templateRoot,
      FnzTemplatesConsts.REPORTES.seguimiento,
    );

    const subject = `Reporte de seguimiento`;

    return await this.notifyMailService
      .setConfig(body.mailOptions, i18n.lang)
      .sendMail(subject, template, replacement);
  }
}
