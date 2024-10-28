import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { map, tap } from 'rxjs/operators';

export interface ResponseImageDTO {
  id: string;
  originalImageUrl: string;
  removedImageUrl: string;
  size: number;
}

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private readonly uploadUrl = 'api/upload-image';
  private readonly removeUrl = 'api/remove-image';

  constructor(
    private readonly http: HttpClient,
    private readonly cookieService: CookieService,
  ) {}

  // Upload image method
  uploadImage(file: File): Observable<ResponseImageDTO> {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return this.http
      .post<ResponseImageDTO>(this.uploadUrl, formData, {
        observe: 'response',
        withCredentials: true,
      })
      .pipe(
        map(response => {
          if (response.body) {
            this.storeImagePathsInCookies(response.body.originalImageUrl, response.body.removedImageUrl);
            return response.body;
          }
          throw new Error('Empty response body');
        }),
      );
  }

  // Get original image path from cookie
  getOriginalImagePathFromCookie(): string | null {
    const path = this.cookieService.get('originalImagePath');
    return path ? decodeURIComponent(path) : null;
  }

  // Get removed image path from cookie
  getRemovedImagePathFromCookie(): string | null {
    const path = this.cookieService.get('removedImagePath');
    return path ? decodeURIComponent(path) : null;
  }

  // Delete image from server
  deleteImage(): Observable<unknown> {
    return this.http.delete(this.removeUrl, { withCredentials: true }).pipe(tap(() => this.clearImageCookies()));
  }

  // Clear cookies for image paths
  clearImageCookies(): void {
    this.cookieService.delete('originalImagePath', '/');
    this.cookieService.delete('removedImagePath', '/');
  }

  // Store image paths in cookies
  private storeImagePathsInCookies(originalImageUrl: string, removedImageUrl: string): void {
    const expirationInHours = 1; // 1-hour expiration
    this.cookieService.set('originalImagePath', originalImageUrl, expirationInHours / 24, '/', undefined, false, 'Strict');
    this.cookieService.set('removedImagePath', removedImageUrl, expirationInHours / 24, '/', undefined, false, 'Strict');
  }
}
