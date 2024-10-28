import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IAdvertisement, NewAdvertisement } from '../advertisement.model';

export type PartialUpdateAdvertisement = Partial<IAdvertisement> & Pick<IAdvertisement, 'id'>;

type RestOf<T extends IAdvertisement | NewAdvertisement> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestAdvertisement = RestOf<IAdvertisement>;

export type NewRestAdvertisement = RestOf<NewAdvertisement>;

export type PartialUpdateRestAdvertisement = RestOf<PartialUpdateAdvertisement>;

export type EntityResponseType = HttpResponse<IAdvertisement>;
export type EntityArrayResponseType = HttpResponse<IAdvertisement[]>;

@Injectable({ providedIn: 'root' })
export class AdvertisementService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/advertisements');

  create(advertisement: NewAdvertisement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advertisement);
    return this.http
      .post<RestAdvertisement>(this.resourceUrl, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(advertisement: IAdvertisement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advertisement);
    return this.http
      .put<RestAdvertisement>(`${this.resourceUrl}/${this.getAdvertisementIdentifier(advertisement)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(advertisement: PartialUpdateAdvertisement): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(advertisement);
    return this.http
      .patch<RestAdvertisement>(`${this.resourceUrl}/${this.getAdvertisementIdentifier(advertisement)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestAdvertisement>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestAdvertisement[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getAdvertisementIdentifier(advertisement: Pick<IAdvertisement, 'id'>): number {
    return advertisement.id;
  }

  compareAdvertisement(o1: Pick<IAdvertisement, 'id'> | null, o2: Pick<IAdvertisement, 'id'> | null): boolean {
    return o1 && o2 ? this.getAdvertisementIdentifier(o1) === this.getAdvertisementIdentifier(o2) : o1 === o2;
  }

  addAdvertisementToCollectionIfMissing<Type extends Pick<IAdvertisement, 'id'>>(
    advertisementCollection: Type[],
    ...advertisementsToCheck: (Type | null | undefined)[]
  ): Type[] {
    const advertisements: Type[] = advertisementsToCheck.filter(isPresent);
    if (advertisements.length > 0) {
      const advertisementCollectionIdentifiers = advertisementCollection.map(advertisementItem =>
        this.getAdvertisementIdentifier(advertisementItem),
      );
      const advertisementsToAdd = advertisements.filter(advertisementItem => {
        const advertisementIdentifier = this.getAdvertisementIdentifier(advertisementItem);
        if (advertisementCollectionIdentifiers.includes(advertisementIdentifier)) {
          return false;
        }
        advertisementCollectionIdentifiers.push(advertisementIdentifier);
        return true;
      });
      return [...advertisementsToAdd, ...advertisementCollection];
    }
    return advertisementCollection;
  }

  protected convertDateFromClient<T extends IAdvertisement | NewAdvertisement | PartialUpdateAdvertisement>(advertisement: T): RestOf<T> {
    return {
      ...advertisement,
      createdAt: advertisement.createdAt?.toJSON() ?? null,
      updatedAt: advertisement.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restAdvertisement: RestAdvertisement): IAdvertisement {
    return {
      ...restAdvertisement,
      createdAt: restAdvertisement.createdAt ? dayjs(restAdvertisement.createdAt) : undefined,
      updatedAt: restAdvertisement.updatedAt ? dayjs(restAdvertisement.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestAdvertisement>): HttpResponse<IAdvertisement> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestAdvertisement[]>): HttpResponse<IAdvertisement[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}
