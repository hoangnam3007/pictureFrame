import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CompressModalComponent } from './compress-modal/compress-modal.component';

@Component({
  standalone: true,
  templateUrl: './compress-image.component.html',
  styleUrls: ['./compress-image.component.scss'],
  imports: [CommonModule],
})
export class CompressImageComponent {
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  imgResultAfterCompression: string | null = null;
  checkUpload = false;
  imageHeight: string | null = null;
  imageWidth: string | null = null;
  sizeFile: number | null = null;
  compressionQuality = 50; // Track the current quality
  originalImage: string | null = null; // Store original image data
  fileName: string | null = null;

  private modalService = inject(NgbModal);
  private cdr = inject(ChangeDetectorRef);
  constructor(private imageCompress: NgxImageCompressService) {}

  onChoosePhoto(event: Event, quality: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.checkUpload = false;
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.sizeFile = file.size / 1000;
        this.fileName = file.name;
        this.compressFile(quality);
      }
      input.value = '';
    }
  }

  validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      Swal.fire('Only JPEG or JPG files are supported.');
      return false;
    }
    return true;
  }

  compressFile(quality: number): void {
    const reader = new FileReader();
    reader.onload = () => {
      const base64Image = reader.result as string;
      this.originalImage = base64Image; // Store the original image data
      this.imageCompress
        .compressFile(base64Image, -1, 100, quality)
        .then(compressedImage => {
          this.imgResultAfterCompression = compressedImage;
          this.selectedFile = null;
          this.checkUpload = true;

          const img = new Image();
          img.src = compressedImage;
          img.onload = () => {
            const maxWidth = 720;
            const maxHeight = 540;
            let targetWidth = img.naturalWidth;
            let targetHeight = img.naturalHeight;

            const widthRatio = maxWidth / targetWidth;
            const heightRatio = maxHeight / targetHeight;
            const scaleRatio = Math.min(widthRatio, heightRatio);

            if (scaleRatio < 1) {
              targetWidth = targetWidth * scaleRatio;
              targetHeight = targetHeight * scaleRatio;
            }

            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              this.imgResultAfterCompression = canvas.toDataURL('image/jpeg', quality / 100);
              this.imageWidth = `${Math.round(targetWidth)}px`;
              this.imageHeight = `${Math.round(targetHeight)}px`;

              // Open modal with resized image and initial quality
              this.settingSize();
            }
          };
        })
        .catch(() => Swal.fire('Error compressing the image.'));
    };

    if (this.selectedFile) {
      reader.readAsDataURL(this.selectedFile);
    }
  }

  settingSize(): void {
    const modalRef = this.modalService.open(CompressModalComponent, { size: 'lg', backdrop: 'static' });
    modalRef.componentInstance.originalImage = this.originalImage;
    modalRef.componentInstance.sliderValue = this.compressionQuality;

    modalRef.componentInstance.imageCompressed.subscribe((compressedImageUrl: string) => {
      // Handle the emitted compressed image URL
      this.imgResultAfterCompression = compressedImageUrl;
      this.cdr.detectChanges(); // Ensure view is updated with the new image URL
    });

    modalRef.result.then((updatedQuality: number) => {
      this.compressionQuality = updatedQuality;
    });
  }
  downloadFile(): void {
    const blob = this.base64ToBlob(this.imgResultAfterCompression!, 'image/jpeg');
    const blobUrl = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.download = this.fileName ?? 'compress-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  // Make sure this method is inside the class
  private base64ToBlob(base64Data: string, contentType = 'image/jpeg'): Blob {
    const base64Parts = base64Data.split(',');
    const base64String = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
