import { HttpStatus } from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';

export class DefaultResponse {
  private static baseResponse = (
    statusCode: HttpStatus,
    message: string,
    data: any = null,
  ) =>
    <ResponseDto>{
      success: [
        HttpStatus.OK,
        HttpStatus.CREATED,
        HttpStatus.NO_CONTENT,
      ].includes(statusCode),
      statusCode,
      message,
      data,
    };

  /** ERROR HTTP BadRequesT (400): Indica que el servidor no entendió la solicitud */
  static sendBadRequest = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.BAD_REQUEST, message, data);

  /** ERROR HTTP NotFound (404): Indica que el recurso solicitado no existe en el servidor */
  static sendNotFound = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.NOT_FOUND, message, data);

  /** ERROR HTTP Unauthorized (401): Indica que el recurso solicitado requiere autenticación */
  static sendUnauthorized = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.UNAUTHORIZED, message, data);

  /** ERROR HTTP Conflict (409): Indica que no se pudo realizar la solicitud debido a un conflicto en el servidor */
  static sendConflict = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.CONFLICT, message, data);

  /** ERROR HTTP Interal Server Error (500): Indica que se produjo un error en el servidor */
  static sendInternalError = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.INTERNAL_SERVER_ERROR, message, data);

  /** SUCCESS HTTP OK (200): Indica que la solicitud se realizó correctamente y la información solicitada se incluye en la respuesta */
  static sendOk = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.OK, message, data);

  /** SUCCESS HTTP CREATED (201): Indica que la solicitud dio como resultado un nuevo recurso creado antes de enviar la respuesta */
  static sendCreated = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.CREATED, message, data);

  /** SUCCESS HTTP NOCONTENT (204): Indica que la solicitud se procesó correctamente y la respuesta está intencionadamente en blanco */
  static sendNoContent = (message: string, data: any = null) =>
    this.baseResponse(HttpStatus.NO_CONTENT, message, data);
}
