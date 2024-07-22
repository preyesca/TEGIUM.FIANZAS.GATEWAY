import { I18nContext, I18nService } from 'nestjs-i18n';
import { join } from 'path';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';
import { FnzTemplatesConsts } from '../../helpers/consts/fnz.templates.consts';
import { FnzFormatosEntregadosDTO } from '../../helpers/dto/core/formatos-entregados.dto';
import { FnzFisicosEnviadosDTO } from '../../helpers/dto/core/recoleccion-de-fisicos.dto';
import { FnzSolicitudFirmaEjecutivoDTO } from '../../helpers/dto/core/solicitud-firma-ejecutivo.dto';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { NotifyMailService } from '../notify.mail.service';
import { Injectable } from '@nestjs/common';


@Injectable()
export class NotifyMarshPortalService {
    private readonly TEMPLATE_DIRECTORY: string = join('fianzas', 'core');

    constructor(
        private notifyMailService: NotifyMailService,
        private i18n: I18nService<I18nTranslations>,
    ) { }

    async recepcionDocumentos(
        body: FnzFormatosEntregadosDTO,
        i18n: I18nContext,
    ): Promise<ResponseDto> {
        const replacement = {
            numeroCliente: body.numeroCliente,
            nombreContacto: body.nombreAsegurado,
            aseguradora: body.aseguradora,
            appUrl: process.env.APP_URL,
        };

        const subject = `${this.i18n.translate(
            'notificaciones.PORTAL.RECEPCION_DOCUMENTOS.ASUNTO',
            {
                lang: i18n.lang,
            },
        )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

        const template = join(
            this.TEMPLATE_DIRECTORY,
            FnzTemplatesConsts.CORE.recepcionDocumentos,
        );

        return await this.notifyMailService
            .setConfig(body.mailOptions, i18n.lang)
            .sendMail(subject, template, replacement);
    }

    async solicitudFirmaEjecutivo(
        body: FnzSolicitudFirmaEjecutivoDTO,
        i18n: I18nContext,
    ): Promise<ResponseDto> {
        const replacement = {
            numeroCliente: body.numeroCliente,
            nombreAsegurado: body.nombreAsegurado,
            aseguradora: body.aseguradora,
            razonSocial: body.razonSocial,
            appUrl: process.env.APP_URL,
        };

        const subject = `${this.i18n.translate(
            'notificaciones.CORE.SOLICITUD_FIRMA_EJECUTIVO.ASUNTO',
        )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

        const template = join(
            this.TEMPLATE_DIRECTORY,
            FnzTemplatesConsts.CORE.solicitudFirmaEjecutivo,
        );
        return await this.notifyMailService
            .setConfig(body.mailOptions, i18n.lang)
            .sendMail(subject, template, replacement);
    }


    async fisicosEnviados(
        body: FnzFisicosEnviadosDTO,
        i18n: I18nContext,
    ): Promise<ResponseDto> {
        const replacement = {
            numeroCliente: body.numeroCliente,
            nombreAsegurado: body.nombreAsegurado,
            observaciones: body.observaciones,
            appUrl: process.env.APP_URL,
            claveGuia: body.claveGuia
        };

        const subject = `${this.i18n.translate(
            'notificaciones.CORE.FISICOS_ENVIADOS.ASUNTO',
            {
                lang: i18n.lang,
            },
        )} • ${body.numeroCliente} - ${body.nombreAsegurado}`;

        const template = join(
            this.TEMPLATE_DIRECTORY,
            FnzTemplatesConsts.CORE.fisicosEnviados,
        );

        return await this.notifyMailService
            .setConfig(body.mailOptions, i18n.lang)
            .sendMail(subject, template, replacement);
    }

}
