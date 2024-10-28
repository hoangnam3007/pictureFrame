import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IFrame } from '../frame.model';
import { FrameService } from '../service/frame.service';

const frameResolve = (route: ActivatedRouteSnapshot): Observable<null | IFrame> => {
  const id = route.params.id;
  if (id) {
    return inject(FrameService)
      .find(id)
      .pipe(
        mergeMap((frame: HttpResponse<IFrame>) => {
          if (frame.body) {
            return of(frame.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default frameResolve;
