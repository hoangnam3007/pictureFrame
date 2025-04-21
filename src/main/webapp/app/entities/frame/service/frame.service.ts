import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

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

export interface ImageDTO {
  id: number;
  imageUrl: string;
}

export type RestFrame = RestOf<IFrame>;

export type NewRestFrame = RestOf<NewFrame>;

export type PartialUpdateRestFrame = RestOf<PartialUpdateFrame>;

export type EntityResponseType = HttpResponse<IFrame>;
export type EntityImgDTO = HttpResponse<ImageDTO>;
export type EntityArrayResponseType = HttpResponse<IFrame[]>;

@Injectable({ providedIn: 'root' })
export class FrameService {
  protected http = inject(HttpClient);
  protected applicationConfigService = inject(ApplicationConfigService);

  protected resourceUrl = this.applicationConfigService.getEndpointFor('api/frames');
  protected resourceImg = this.applicationConfigService.getEndpointFor('api/create-frame/saveImage');
  protected resourceImgNew = this.applicationConfigService.getEndpointFor('api/create-frame');
  create(frame: NewFrame): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(frame);
    return this.http.post<RestFrame>(this.resourceUrl, copy, { observe: 'response' }).pipe(map(res => this.convertResponseFromServer(res)));
  }

  getFrameByDate(): Observable<IFrame[]> {
    const url = `${this.resourceUrl}/getFrameNearest`;
    return this.http.get<IFrame[]>(url); // Expecting the API to return a list of frames
  }

  checkExistedByUrl(url: string): Observable<boolean> {
    const link = `${this.resourceUrl}/checkExistUrl?url=${encodeURIComponent(url)}`;
    return this.http.get<boolean>(link).pipe(
      map((response: boolean) => response), // Map the response to a boolean
    );
  }

  createFrame(file: File, guidelineUrl: string): Observable<ImageDTO> {
    const formData = new FormData();
    formData.append('file', file);

    // Construct the URL with the guidelineUrl as a query parameter
    const uploadUrl = `${this.resourceImg}?url=${encodeURIComponent(guidelineUrl)}`;

    return this.http.post<ImageDTO>(uploadUrl, formData).pipe(
      map((response: ImageDTO) => {
        return response;
      }),
    );
  }

  updateFrame(file: File, guidelineUrl: string, existingFileName: string): Observable<ImageDTO> {
    const formData = new FormData();
    formData.append('file', file); // Append the file

    // Construct the URL with query parameters for guidelineUrl and existingFileName
    const uploadUrl = `${this.resourceImgNew}/updateImage?url=${encodeURIComponent(guidelineUrl)}&existingFileName=${encodeURIComponent(existingFileName)}`;

    // Make the POST request to the updated URL with the form data
    return this.http.post<ImageDTO>(uploadUrl, formData).pipe(
      map((response: ImageDTO) => {
        return response; // Return the ImageDTO response
      }),
    );
  }

  getFrameByGuidelineUrl(guidelineUrl: string): Observable<IFrame> {
    const url = `${this.resourceUrl}/search?guidelineUrl=${encodeURIComponent(guidelineUrl)}`;
    return this.http.get<IFrame>(url);
  }

  update(frame: IFrame): Observable<EntityResponseType> {
    const copy = this.convertDateFromClient(frame);
    return this.http
      .put<RestFrame>(`${this.resourceUrl}/${this.getFrameIdentifier(frame)}`, copy, { observe: 'response' })
      .pipe(map(res => this.convertResponseFromServer(res)));
  }

  deleteUrl(guidelineUrl: string): Observable<any> {
    const url = `${this.resourceImgNew}/deleteUrl?url=${encodeURIComponent(guidelineUrl)}`;
    return this.http.delete<any>(url).pipe(catchError(this.handleError));
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

  private handleError(error: HttpErrorResponse): Observable<never> {
    return throwError(() => new Error('Something went wrong!'));
  }
}
