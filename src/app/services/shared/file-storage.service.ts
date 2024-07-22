import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import { I18nService } from 'nestjs-i18n';
import * as path from 'path';
import { ResponseDto } from 'src/app/common/dto/response.dto';
import { EStorageFolder } from 'src/app/common/enum/catalogo/directory.enum';
import { EProceso } from 'src/app/common/enum/catalogo/proceso.enum';
import { DefaultResponse } from 'src/app/common/response/default.response';
import { I18nTranslations } from 'src/app/translation/translate/i18n.translate';

@Injectable()
export class FileStorageService {
  private readonly _logger: Logger = new Logger(FileStorageService.name);
  private readonly _rootFiles: string = process.env.MSH_REPOSITORY_PATH;
  private readonly _sep: string = process.env.MSH_REPOSITORY_SEPARATOR ?? '\\';

  constructor(private i18n: I18nService<I18nTranslations>) {}

  /**
   * Endpoint para descargar un archivo del Bucket de S3
   * @param lang (type) **string :** `Idioma de traducción`
   * @param path (type) **string :** `Path del archivo incluyendo el` filename. (Ejm: 'KYC/expedientes/145455/archivo.pdf')
   * @returns Retorna un objeto ResponseDto = data: { **contentType** y **base64** }
   */
  async downloadBase64(
    lang: string,
    pathAndFilename: string,
    contentType: string,
  ): Promise<ResponseDto> {
    try {
      this._logger.verbose('=========================== START MESSAGE');
      this._logger.verbose(`PathAndFilename : ${pathAndFilename}`);
      this._logger.verbose(`Lang : ${lang}`);

      const rootAndFilename = `${this._rootFiles}${this._sep}${pathAndFilename}`;

      if (!fs.existsSync(rootAndFilename))
        throw new Error(`Archivo no encontrado: ${rootAndFilename}`);

      const fileBuffer = fs.readFileSync(rootAndFilename);
      const base64 = fileBuffer.toString('base64');

      const data = {
        contentType,
        base64,
      };

      this._logger.verbose(
        `SUCCESS (FileStorageService.download(...)): (byteArray)`,
      );
      this._logger.verbose('=========================== END MESSAGE');

      return DefaultResponse.sendOk(
        this.i18n.translate('expediente.FILE.SUCCESS.DOWNLOAD', {
          lang,
        }),
        data,
      );
    } catch (e) {
      this._logger.error(
        `ERROR (FileStorageService.download(...)): ${JSON.stringify(e)}`,
      );
      this._logger.error('=========================== END MESSAGE');

      return DefaultResponse.sendInternalError(
        this.i18n.translate('expediente.FILE.ERROR.DOWNLOAD', {
          lang,
        }),
      );
    }
  }

  /**
   * Endpoint para subir un archivo al Bucket de S3
   * @param process (type) **EProceso :** `Proceso de la actividad que va a realizar la operación`
   * @param storageFolder (type) **EStorageFolder :** `Nombre del directorio para almacenar los archivos. (Ejm: expedientes)`
   * @param lang (type) **string :** `Idioma de traducción`
   * @param file (type) **Express.Multer.File :** `Contexto para determinar el diccionario i18n de la respuesta`
   * @param pathAndFilename (type) **string :** `Path del archivo incluyendo el` filename. (Ejm: 'Aseguradora{sep}145455{sep}archivo.pdf') Las separaciones de las rutas deben utilizar {sep}.
   * @returns Retorna un objeto ResponseDto: { data: **string**  }
   */
  async upload(
    process: EProceso,
    storageFolder: EStorageFolder,
    lang: string,
    file: Express.Multer.File,
    pathAndFilename: string,
  ): Promise<ResponseDto> {
    try {
      pathAndFilename = pathAndFilename.replaceAll('{sep}', this._sep);

      this._logger.verbose('=========================== START MESSAGE');
      this._logger.verbose(`PathAndFilename : ${pathAndFilename}`);
      this._logger.verbose(`Lang : ${lang}`);
      this._logger.verbose(`File (OriginalName) : ${file.originalname}`);
      this._logger.verbose(`File (Size): ${file.size}`);
      this._logger.verbose(`File (ContentType): ${file.mimetype}`);

      if (!fs.existsSync(this._rootFiles)) {
        var rootCreated = fs.mkdirSync(this._rootFiles, { recursive: true });

        if (!rootCreated)
          throw new Error(
            `Se produjo un error al crear el directorio: ${rootCreated}`,
          );
      }

      const subRoot = `${this.getRootPath(process, storageFolder)}${
        this._sep
      }${pathAndFilename}`;

      this._logger.verbose(`SubRoot : ${subRoot}`);

      const rootAndFilename = `${this._rootFiles}${this._sep}${subRoot}`;
      const folderPath = path.dirname(rootAndFilename);

      if (!fs.existsSync(folderPath)) {
        var folderPathCreated = fs.mkdirSync(folderPath, { recursive: true });

        if (!folderPathCreated)
          throw new Error(
            `Se produjo un error al crear el directorio: ${folderPath}`,
          );
      }

      fs.writeFileSync(rootAndFilename, file.buffer);

      this._logger.verbose(`SUCCESS (FileStorageService.upload(...))`);
      this._logger.verbose('=========================== END MESSAGE');

      return DefaultResponse.sendOk(
        this.i18n.translate('expediente.FILE.SUCCESS.UPLOAD', {
          lang,
        }),
        subRoot,
      );
    } catch (e) {
      this._logger.error(
        `ERROR (FileStorageService.upload(...)): ${JSON.stringify(e)}`,
      );
      this._logger.error('=========================== END MESSAGE');

      return DefaultResponse.sendInternalError(
        this.i18n.translate('expediente.FILE.ERROR.UPLOAD', {
          lang,
        }),
      );
    }
  }

  /**
   * Endpoint para eliminar un archivo del S3
   * @param lang (type) **string :** `Idioma de traducción`
   * @param path (type) **string :** `Path del archivo en AWS.S3 incluyendo el` filename. (Ejm: '145455/archivo.pdf')
   * @returns Retorna un objeto ResponseDto
   */
  async delete(lang: string, path: string): Promise<ResponseDto> {
    try {
      this._logger.verbose('=========================== START MESSAGE');
      this._logger.verbose(`Key : ${path}`);
      this._logger.verbose(`Lang : ${lang}`);

      this._logger.verbose(`SUCCESS (FileStorageService.delete(...))`);
      this._logger.verbose('=========================== END MESSAGE');

      return DefaultResponse.sendOk(
        this.i18n.translate('expediente.FILE.SUCCESS.DELETE', {
          lang,
        }),
      );
    } catch (e) {
      this._logger.error(
        `ERROR (FileStorageService.delete(...)): ${JSON.stringify(e)}`,
      );
      this._logger.error('=========================== END MESSAGE');

      return DefaultResponse.sendInternalError(
        this.i18n.translate('expediente.FILE.ERROR.DELETE', {
          lang,
        }),
      );
    }
  }

  private getRootPath(
    process: EProceso,
    storageFolder: EStorageFolder,
  ): string {
    switch (storageFolder) {
      case EStorageFolder.CARGAS_MASIVAS:
        return `${EProceso[process]}${this._sep}cargas-masivas`;
      case EStorageFolder.EXPEDIENTES:
        return `${EProceso[process]}${this._sep}expedientes`;
      case EStorageFolder.FIRMAS_DE_EJECUTIVOS:
        return `${EProceso[process]}${this._sep}firmas-ejecutivo`;
      case EStorageFolder.COTEJADOS:
        return `${EProceso[process]}${this._sep}expedientes-cotejados`;
      default:
        throw new Error(
          `:::ERROR (FileStorageService): El valor '${storageFolder}' de EStorageFolder no es válido.`,
        );
    }
  }
}
