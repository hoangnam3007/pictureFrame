import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { ResponseImageDTO, ImageService } from './remove-background.service';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  templateUrl: './remove-background.component.html',
  styleUrls: ['./remove-background.component.scss'],
  imports: [RouterModule, SharedModule],
})
export class RemoveBackgroundComponent implements OnInit, OnDestroy {
  imageUploaded = false;
  originalImagePath: string | null = null;
  removedImagePath: string | null = null;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  loading = false;
  readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  // Injecting the ImageService
  private imageService = inject(ImageService);

  ngOnInit(): void {
    this.checkExistingImages();
  }

  ngOnDestroy(): void {
    if (this.loading) {
      this.clearSelection();
    }
  }

  onChoosePhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];

      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.uploadImage(file);
      }

      input.value = '';
    }
  }

  validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png'];

    if (!validTypes.includes(file.type)) {
      this.errorMessage = 'Only JPG/PNG formats are supported.';
      return false;
    }

    if (file.size > this.maxFileSize) {
      this.errorMessage = 'File size exceeds the 5MB limit.';
      return false;
    }

    return true;
  }

  tryAnotherImage(): void {
    if (this.imageUploaded) {
      this.loading = true;
      this.imageService
        .deleteImage()
        .pipe(
          finalize(() => {
            this.loading = false;
          }),
        )
        .subscribe({
          next: () => {
            this.resetState();
          },
          error: (error: Error) => {
            this.errorMessage = error.message;
          },
        });
    } else {
      this.resetState();
    }
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.errorMessage = null;
  }

  private checkExistingImages(): void {
    this.originalImagePath = this.imageService.getOriginalImagePathFromCookie();
    this.removedImagePath = this.imageService.getRemovedImagePathFromCookie();
    this.imageUploaded = !!(this.originalImagePath && this.removedImagePath);
  }

  private uploadImage(file: File): void {
    this.loading = true;
    this.errorMessage = null;

    this.imageService
      .uploadImage(file)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (response: ResponseImageDTO) => {
          this.originalImagePath = response.originalImageUrl;
          this.removedImagePath = response.removedImageUrl;
          this.imageUploaded = true;
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.clearSelection();
        },
      });
  }

  private resetState(): void {
    this.imageUploaded = false;
    this.selectedFile = null;
    this.errorMessage = null;
    this.originalImagePath = null;
    this.removedImagePath = null;
  }
}
