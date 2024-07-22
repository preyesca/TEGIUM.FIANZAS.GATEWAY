import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  RequestTimeoutException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nContext, I18nValidationException } from 'nestjs-i18n';
import { formatI18nErrors } from 'nestjs-i18n/dist/utils/util';
import { ResponseDto } from '../../common/dto/response.dto';
import { DefaultResponseException } from '../../common/response/default-exception.response';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    console.log(exception);
    console.log('####################');
    console.log(JSON.stringify(exception));

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const msg =
      exception instanceof HttpException ? exception.getResponse() : exception;

    const i18n = I18nContext.current();

    this.logger.debug('==========================================');
    this.logger.log('ERROR API GATEWAY');
    this.logger.verbose(`Estatus: ${status}`);
    this.logger.error(`Error: ${JSON.stringify(msg)}`);
    this.logger.warn('==========================================');

    if (exception instanceof I18nValidationException) {
      const errors = formatI18nErrors(exception.errors ?? [], i18n.service, {
        lang: i18n.lang,
      });
      response.status(406).json({
        success: false,
        message: i18n.t('all.VALIDATIONS.ERROR_GENERAL', { lang: i18n.lang }),
        data: errors,
      });
    } else if (exception instanceof RequestTimeoutException) {
      response.status(408).json({
        success: false,
        message: i18n.t('server.STATUS_CODE.408', { lang: i18n.lang }),
        data: request.url,
      });
    } else if (exception instanceof UnauthorizedException) {
      response.status(401).json({
        success: false,
        message: i18n.t('server.STATUS_CODE.401', { lang: i18n.lang }),
        data: request.url,
      });
    } else if (exception instanceof DefaultResponseException) {
      const defaultResponse: ResponseDto = <ResponseDto>exception.getResponse();
      response.status(defaultResponse.statusCode).json({
        success: false,
        message: defaultResponse.message,
      });
    } else
      response.status(status).json({
        status: false,
        message: i18n.t('server.STATUS_CODE.500', {
          lang: i18n.lang,
        }),
        data: exception,
      });
  }
}
