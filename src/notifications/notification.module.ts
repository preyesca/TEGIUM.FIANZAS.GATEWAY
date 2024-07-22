import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from "@nestjs/common";
import { I18nService } from "nestjs-i18n";
import { join } from "path";
import { SharedServicesModule } from "src/app/services/services.module";
import { NotifyMailService } from "./domain/services/notify.mail.service";
import { NotifyMarshCoreService } from "./domain/services/marsh/notify.marsh-core.service";
import { NotifyMarshPortalService } from "./domain/services/marsh/notify.marsh-portal.service";
import { NotifyAuthenticationService } from "./domain/services/authentication/notify.authentication.service";
import { NotifyMarshReportesService } from "./domain/services/marsh/notify.marsh-reportes.service";

const Services = [
    NotifyAuthenticationService,
    NotifyMailService,
    NotifyMarshPortalService,
    NotifyMarshCoreService,
    NotifyMarshReportesService
]

@Module({
    imports: [
        MailerModule.forRootAsync({
            inject: [I18nService],
            useFactory: (i18n: I18nService) => {
                return {
                    transport: {
                        host: process.env.MSH_MAIL_HOST,
                        secure: process.env.MSH_MAIL_SECURE === 'true',
                        port: Number(process.env.MSH_MAIL_PORT),
                        auth: {
                            user: process.env.MSH_MAIL_USER,
                            pass: process.env.MSH_MAIL_PASSWORD,
                        },
                    },
                    defaults: {
                        from: `"${process.env.MSH_MAIL_FROM}" <${process.env.MSH_MAIL_USER}>`,
                    },
                    template: {
                        dir: join(__dirname, 'views', 'templates'),
                        adapter: new HandlebarsAdapter({ t: i18n.hbsHelper }),
                        options: { strict: true },
                    },
                };
            },
        }),

        SharedServicesModule,
    ],
    providers: Services,
    exports: Services,
})
export class NotificationModule { }
