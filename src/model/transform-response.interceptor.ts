import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformResponseInterceptor<T>
  implements NestInterceptor<T, any>
{
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Tambahkan modifikasi respons di sini
    return next.handle().pipe(
      map((data) => {
        return {
          status: 'success',
          data: data || null,
          errors: null,
        };
      }),
    );
  }
}
