const fetch = require('node-fetch');
import { Injectable, Logger } from '@nestjs/common';
import { SecurityHelper } from '../../utils/security/password.security';

@Injectable()
export class NotificationService {
  private readonly _logger = new Logger(NotificationService.name);

  async send(
    url: string,
    bodyObject?: any,
    bearerToken?: string,
  ): Promise<void> {
    const body = bodyObject ? JSON.stringify(bodyObject) : {};

    this._logger.verbose('=========================== START MESSAGE');
    this._logger.verbose(`Url  : ${url}`);
    this._logger.verbose(`Body : ${body}`);
    this._logger.verbose(
      `Bearer : ${SecurityHelper.hiddenSecret(bearerToken)}`,
    );

    const headers = {
      'Content-Type': 'application/json',
    };

    if (bearerToken) headers['Authorization'] = bearerToken;

    await fetch(url, {
      method: 'POST',
      headers,
      body,
    })
      .then((resp: any) => resp.json())
      .then(() => {
        this._logger.verbose('SUCCESS (NotificationService): Mensaje enviado.');
        this._logger.verbose('=========================== END MESSAGE');
      })
      .catch((error: any) => {
        this._logger.error(`ERROR (NotificationService): ${error?.message}`);
        this._logger.verbose('=========================== END MESSAGE');
      });
  }
}
