import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import SharedModule from 'app/shared/shared.module';
import { NgxImageCompressService } from 'ngx-image-compress';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'jhi-order-assign',
  templateUrl: './compress-modal.component.html',
  styleUrls: ['./compress-modal.component.scss'],
  imports: [SharedModule, FormsModule], // Import FormsModule here
})
export class CompressModalComponent implements OnInit {
  @Input() originalImage: string | null = null;
  @Input() imageHeight: number | null = null;
  @Input() imageWidth: number | null = null;
  @Input() sliderValue = 50; // Initialize sliderValue with default 50
  @Output() imageCompressed = new EventEmitter<string>(); // New output to emit the compressed image URL
  imageUrl: string | null = null;
  public activeModal = inject(NgbActiveModal);
  constructor(private imageCompress: NgxImageCompressService) {}

  ngOnInit(): void {
    if (this.originalImage) {
      this.imageUrl = this.originalImage;
      this.loadImageDimensions(this.originalImage);
      this.compressImage(this.sliderValue);
    }
  }

  onSliderChange(): void {
    if (this.originalImage) {
      this.compressImage(this.sliderValue);
    }
  }

  compressImage(quality: number): void {
    this.imageCompress.compressFile(this.originalImage!, -1, 100, quality).then(compressedImage => {
      this.imageUrl = compressedImage;
      this.imageCompressed.emit(compressedImage);
    });
  }

  closeModal(): void {
    this.activeModal.close(this.sliderValue);
  }
  private loadImageDimensions(imageUrl: string): void {
    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      this.imageWidth = img.width;
      this.imageHeight = img.height;
    };
  }
}
