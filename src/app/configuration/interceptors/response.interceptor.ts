import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { ResponseDto } from '../../common/dto/response.dto';
import { DefaultResponseException } from '../../common/response/default-exception.response';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((res: ResponseDto) => {
        const response = {
          success: res.success,
          message: res.message,
          data: res.data,
        };

        const status = res?.statusCode ?? 200;

        if (status === 200 || status === 201) return response;
        else
          throw new DefaultResponseException(
            response.message,
            response.data,
            res.statusCode,
          );
      }),
    );
  }
}
