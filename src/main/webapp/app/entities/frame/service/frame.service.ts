import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import dayjs from 'dayjs/esm';

import { isPresent } from 'app/core/util/operators';
import { ApplicationConfigService } from 'app/core/config/application-config.service';
import { createRequestOption } from 'app/core/request/request-util';
import { IFrame, NewFrame } from '../frame.model';

export type PartialUpdateFrame = Partial<IFrame> & Pick<IFrame, 'id'>;

type RestOf<T extends IFrame | NewFrame> = Omit<T, 'createdAt' | 'updatedAt'> & {
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type RestFrame = RestOf<IFrame>;

export type NewRestFrame = RestOf<NewFrame>;

export type PartialUpdateRestFrame = RestOf<PartialUpdateFrame>;

export type EntityResponseType = HttpResponse<IFrame>;
export type EntityArrayResponseType = HttpResponse<IFrame[]>;

@Injectable({ providedIn: 'root' })
export class FrameService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/frames');

  create(frame: NewFrame): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(frame);
    return this.http.post<RestFrame>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  update(frame: IFrame): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(frame);
    return this.http
      .put<RestFrame>(`${this.resourceUrl}/${this.getFrameIdentifier(frame)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  partialUpdate(frame: PartialUpdateFrame): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(frame);
    return this.http
      .patch<RestFrame>(`${this.resourceUrl}/${this.getFrameIdentifier(frame)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  find(id: number): Observable<EntityResponseType> {
    return this.http
      .get<RestFrame>(`${this.resourceUrl}/${id}`, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  query(req?: any): Observable<EntityArrayResponseType> {
    const options = createRequestOption(req);
    return this.http
      .get<RestFrame[]>(this.resourceUrl, { params: options, observe: 'response' })
      .pipe(map(res => this.convertResponseArrayFromServer(res)));
  }

  delete(id: number): Observable<HttpResponse<{}>> {
    return this.http.delete(`${this.resourceUrl}/${id}`, { observe: 'response' });
  }

  getFrameIdentifier(frame: Pick<IFrame, 'id'>): number {
    return frame.id;
  }

  compareFrame(o1: Pick<IFrame, 'id'> | null, o2: Pick<IFrame, 'id'> | null): boolean {
    return o1 && o2 ? this.getFrameIdentifier(o1) === this.getFrameIdentifier(o2) : o1 === o2;
  }

  addFrameToCollectionIfMissing<Type extends Pick<IFrame, 'id'>>(
    frameCollection: Type[],
    ...framesToCheck: (Type | null | undefined)[]
  ): Type[] {
    const frames: Type[] = framesToCheck.filter(isPresent);
    if (frames.length > 0) {
      const frameCollectionIdentifiers = frameCollection.map(frameItem => this.getFrameIdentifier(frameItem));
      const framesToAdd = frames.filter(frameItem => {
        const frameIdentifier = this.getFrameIdentifier(frameItem);
        if (frameCollectionIdentifiers.includes(frameIdentifier)) {
          return false;
        }
        frameCollectionIdentifiers.push(frameIdentifier);
        return true;
      });
      return [...framesToAdd, ...frameCollection];
    }
    return frameCollection;
  }

  protected convertDateFromClient<T extends IFrame | NewFrame | PartialUpdateFrame>(frame: T): RestOf<T> {
    return {
      ...frame,
      createdAt: frame.createdAt?.toJSON() ?? null,
      updatedAt: frame.updatedAt?.toJSON() ?? null,
    };
  }

  protected convertDateFromServer(restFrame: RestFrame): IFrame {
    return {
      ...restFrame,
      createdAt: restFrame.createdAt ? dayjs(restFrame.createdAt) : undefined,
      updatedAt: restFrame.updatedAt ? dayjs(restFrame.updatedAt) : undefined,
    };
  }

  protected convertResponseFromServer(res: HttpResponse<RestFrame>): HttpResponse<IFrame> {
    return res.clone({
      body: res.body ? this.convertDateFromServer(res.body) : null,
    });
  }

  protected convertResponseArrayFromServer(res: HttpResponse<RestFrame[]>): HttpResponse<IFrame[]> {
    return res.clone({
      body: res.body ? res.body.map(item => this.convertDateFromServer(item)) : null,
    });
  }
}