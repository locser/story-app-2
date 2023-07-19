// import { CacheInterceptor } from '@nestjs/cache-manager';
// import { Injectable } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { tap } from 'rxjs/operators';

// @Injectable()
// export class CustomCacheInterceptor extends CacheInterceptor {
//   constructor(private readonly cacheManager: any) {
//     super();
//   }

//   intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>>;
//     const key = this.trackBy(context);
//     return super.intercept(context, next).pipe(
//       tap(() => {
//         this.cacheManager.del(key);
//       }),
//     );
//   }
// }
