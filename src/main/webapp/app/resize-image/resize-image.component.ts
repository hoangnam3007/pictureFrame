import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  templateUrl: './resize-image.component.html',
  styleUrls: ['./resize-image.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ResizeImageComponent {
  selectedFile: File | null = null;
  checkUpload = false;
  sizeFile: number | null = null;
  fileName: string | null = null;
  backgroundImageUrl: string | null = null;
  width = 384; // Initial width
  height = 384; // Initial height
  resizedImageUrl: string | null = null; // To store the resized image URL
  checkResize = false;
  keepAspectRatio = false;
  currentStep = 1;

  onChoosePhoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.checkUpload = true;
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.sizeFile = file.size / 1000;
        this.fileName = file.name;
        this.backgroundImageUrl = URL.createObjectURL(file);
      }
      input.value = ''; // Clear the input value to allow re-selection of the same file
    }
  }

  validateFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Only JPEG or JPG files are supported.');
      return false;
    }
    return true;
  }

  onSetSize(width: number, height: number): void {
    if (this.keepAspectRatio && this.backgroundImageUrl) {
      const img = new Image();
      img.src = this.backgroundImageUrl;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (width / height > aspectRatio) {
          width = height * aspectRatio;
        } else {
          height = width / aspectRatio;
        }
        this.width = Math.round(width);
        this.height = Math.round(height);
      };
    } else {
      this.width = width;
      this.height = height;
    }
  }

  setSize(): void {
    if (!this.backgroundImageUrl) return;

    const img = new Image();
    img.src = this.backgroundImageUrl;
    img.onload = () => {
      // Directly use the specified width and height:
      const targetWidth = this.width;
      const targetHeight = this.height;

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw the image with exact dimensions without preserving the aspect ratio:
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Convert canvas to data URL
        this.resizedImageUrl = canvas.toDataURL('image/jpeg', 0.9); // Adjust quality as needed

        // Update the width and height properties to reflect the new dimensions
        this.width = targetWidth;
        this.height = targetHeight;
        this.checkResize = true;
        this.currentStep = 3;
      }
    };
  }

  downloadFile(): void {
    const blob = this.base64ToBlob(this.resizedImageUrl!, 'image/jpeg');
    const blobUrl = URL.createObjectURL(blob);

    const a: HTMLAnchorElement = document.createElement('a');
    a.href = blobUrl;
    a.download = this.fileName ?? 'resize-image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  }

  changeStep(step: number): void {
    this.currentStep = step;
    if (step === 2) {
      this.checkResize = false;
    }
  }

  // Make sure this method is inside the class
  private base64ToBlob(base64Data: string, contentType = 'image/jpeg'): Blob {
    // Ensure we only get the base64 part of the Data URL (if present)
    const base64Parts = base64Data.split(',');
    const base64String = base64Parts.length > 1 ? base64Parts[1] : base64Parts[0];

    // Decode the Base64 string
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: contentType });
  }
}
