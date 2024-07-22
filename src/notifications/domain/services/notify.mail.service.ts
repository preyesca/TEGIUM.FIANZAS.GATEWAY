import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { FnzMailOptionsDTO } from '../helpers/dto/mail.dto';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { AppConsts } from 'src/app/AppConsts';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { join } from 'path';
import handlebars from 'handlebars';
import { GeneralValidator } from 'src/app/utils/validators/general.validator';
import { FileStorageService } from 'src/app/services/shared/file-storage.service';
import fs = require('fs');




@Injectable()
export class NotifyMailService {
  private mailOptions: FnzMailOptionsDTO = <FnzMailOptionsDTO>{};
  private lang: string = AppConsts.APP.Language;

  constructor(
    private readonly mailerService: MailerService,
    private readonly fileStorageService: FileStorageService,
    private i18n: I18nService<I18nTranslations>,
  ) { }

  setConfig(mailOptions: FnzMailOptionsDTO, lang: string): this {
    this.mailOptions = mailOptions;
    this.lang = lang;
    return this;
  }

  async sendMail(
    subject: string,
    nameTemplate: string,
    replacement: any,
  ): Promise<ResponseDto> {
    try {
      if (!this.mailOptions.to || this.mailOptions.to.length === 0)
        throw new Error(
          this.i18n.translate('notificaciones.MAIL.VALIDACIONES.NO_DESTINATARIOS', {
            lang: this.lang,
          }),
        );

      const html = this.getTemplate(nameTemplate,  replacement );
      const options: ISendMailOptions = {
        to: this.mailOptions.to,
        subject,
        html,
      };

      if (this.mailOptions.cc && this.mailOptions.cc.length > 0) {
        if (this.mailOptions.cc.some((c) => !GeneralValidator.isEmail(c)))
          throw new Error(
            this.i18n.translate('notificaciones.MAIL.VALIDACIONES.NO_EMAIL_CC', {
              lang: this.lang,
            }),
          );

        options.cc = this.mailOptions.cc;
      }

      if (
        this.mailOptions.attachments &&
        this.mailOptions.attachments.length > 0
      ) {
        const attachments = [];

        for (let a = 0; a < this.mailOptions.attachments.length; a++) {
          const attachment = this.mailOptions.attachments[a];

          if (attachment.valueType == 'path') {
            const donwloadResponse =
              await this.fileStorageService.downloadBase64(
                this.lang,
                attachment.value,
                attachment.contentType,
              );

            if (!donwloadResponse.message)
              throw new Error(donwloadResponse.message);

            const { base64, contentType } = donwloadResponse.data;

            attachments.push({
              filename: attachment.filename,
              content: Buffer.from(base64, 'base64'),
              contentType,
            });
          } else
            attachments.push({
              filename: attachment.filename,
              content: Buffer.from(attachment.value, 'base64'),
              contentType: attachment.contentType,
            });
        }

        options.attachments = attachments;
      }

      await this.mailerService.sendMail(options);

      return <ResponseDto>{
        success: true,
        message: this.i18n.translate('notificaciones.MAIL.SUCCESS', {
          lang: this.lang,
        }),
      };
    } catch (e: any) {
      console.error(e?.message);
      return <ResponseDto>{
        success: false,
        message:
          e.message ||
          this.i18n.translate('notificaciones.MAIL.ERROR', { lang: this.lang }),
      };
    }
  }

  private getTemplate(
    nameTemplate: string,
    replacement = {},
    needContainer: boolean = true,
  ): string {
    const appUrl = process.env.MSH_APP_WEB;

    const rootPath = join(__dirname, '..', '..', 'views');
    const contentBody = fs
      .readFileSync(join(rootPath, 'templates', nameTemplate), 'utf-8')
      .toString();

    const template = handlebars.compile(contentBody);
    const html = template({
      ...replacement,
      appUrl,
    });

    if (!needContainer) return html;

    const contentContainer = fs
      .readFileSync(
        join(rootPath, 'partials', 'partial.container.html'),
        'utf-8',
      )
      .toString();

    const templateContainer = handlebars.compile(contentContainer);

    const htmlContainer = templateContainer({
      copyright: AppConsts.APP.Copyright,
      appUrl,
    });

    return htmlContainer.replace('#body#', html);
  }
}
