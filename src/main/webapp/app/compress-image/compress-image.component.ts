import { Component } from '@angular/core';

@Component({
  standalone: true,
  templateUrl: './compress-image.component.html',
  styleUrls: ['./compress-image.component.scss'],
})
export class CompressImageComponent {
  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0]; // Get the first selected file
    }
  }

  // This method is triggered when the user clicks on "Chọn hình"
  onChoosePhoto(): void {
    if (this.selectedFile) {
      alert();
    }
  }
}
