import { inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { IAdvertisement } from '../advertisement.model';
import { AdvertisementService } from '../service/advertisement.service';

const advertisementResolve = (route: ActivatedRouteSnapshot): Observable<null | IAdvertisement> => {
  const id = route.params.id;
  if (id) {
    return inject(AdvertisementService)
      .find(id)
      .pipe(
        mergeMap((advertisement: HttpResponse<IAdvertisement>) => {
          if (advertisement.body) {
            return of(advertisement.body);
          }
          inject(Router).navigate(['404']);
          return EMPTY;
        }),
      );
  }
  return of(null);
};

export default advertisementResolve;
