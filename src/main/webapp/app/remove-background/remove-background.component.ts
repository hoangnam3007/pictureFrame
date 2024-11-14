import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import SharedModule from 'app/shared/shared.module';
import { ResponseImageDTO, ImageService } from './remove-background.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
@Component({
  standalone: true,
  templateUrl: './remove-background.component.html',
  styleUrls: ['./remove-background.component.scss'],
  imports: [RouterModule, SharedModule],
})
export class RemoveBackgroundComponent implements OnInit, OnDestroy {
  imageUploaded = false;
  showOriginal = true; // State variable to manage which image to display
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

  showImage(type: string): void {
    this.showOriginal = type === 'original';
  }

  tryAnotherImage(): void {
    if (this.imageUploaded) {
      // Show confirmation dialog
      Swal.fire({
        title: 'Are you sure?',
        text: 'You wont be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      }).then(result => {
        if (result.isConfirmed) {
          // Only proceed with deletion if user confirmed
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
        }
      });
    } else {
      // If no image is uploaded, simply reset the state without confirmation
      this.resetState();
    }
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.errorMessage = null;
  }

  // Method to download the removed image
  downloadRemovedImage(): void {
    if (this.removedImagePath) {
      const link = document.createElement('a');
      link.href = this.removedImagePath;
      link.download = 'removed-image.jpg';
      link.click();
    } else {
      this.errorMessage = 'Removed image not available for download.';
    }
  }

  private checkExistingImages(): void {
    this.originalImagePath = this.imageService.getOriginalImagePathFromCookie();
    this.removedImagePath = this.imageService.getRemovedImagePathFromCookie();
    this.imageUploaded = !!(this.originalImagePath && this.removedImagePath);
    this.showOriginal = true; // Default to showing the original image if available
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
          this.showOriginal = true; // Show original image after upload
        },
        error: (error: Error) => {
          this.errorMessage = error.message;
          this.clearSelection();
          this.loading = false;
        },
      });
  }

  private resetState(): void {
    this.imageUploaded = false;
    this.selectedFile = null;
    this.errorMessage = null;
    this.originalImagePath = null;
    this.removedImagePath = null;
    this.showOriginal = true;
  }
}
