import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FrameService } from '../../entities/frame/service/frame.service';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IFrame } from '../../entities/frame/frame.model';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../core/auth/account.service';
import { Account } from 'app/core/auth/account.model';
@Component({
  standalone: true,
  templateUrl: './edit-frame.component.html',
  styleUrls: ['./edit-frame.component.scss'],
  imports: [RouterModule, CommonModule, FormsModule],
})
export class EditFrameComponent implements OnInit, AfterViewInit {
  guidelineUrl: string | null = null;
  account: string | null = null;
  getAccount: Account | null = null;
  frame: IFrame | null = null;
  selectedTypeText: string | null = null;
  selectedTypeColor: string | null = null;
  typeClass: string | null = null;
  publicUrl: string | null = null;
  currentStep = 1;
  checkUpload = false;
  selectedFile: File | null = null;
  imageInFrame: string | null = null;
  scaleFactor = 0.2; // Initial scale factor for the uploaded image
  rotateDegree = 0;
  isFlipped = false;
  isDownload = false;
  @ViewChild('previewCanvas', { static: false }) previewCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  // Cached images
  uploadedImageObj: HTMLImageElement | null = null;
  backgroundImageObj: HTMLImageElement | null = null;

  constructor(
    private frameService: FrameService,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
  ) {}

  ngOnInit(): void {
    // Get query parameters and router state
    this.route.queryParams.subscribe(params => {
      this.guidelineUrl = params['guidelineUrl'] || null;
    });
    if (this.guidelineUrl) {
      this.loadFrame();
    }
  }

  ngAfterViewInit(): void {
    // Draw image on canvas after the view has been initialized
    if (this.backgroundImageObj) {
      this.drawImageOnCanvas(this.scaleFactor);
      this.currentStep = 1;
    }
  }

  onAddFrame(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.imageInFrame = URL.createObjectURL(file);
        this.checkUpload = true;

        // Preload and cache the uploaded image
        this.uploadedImageObj = new Image();
        this.uploadedImageObj.src = this.imageInFrame;
        this.uploadedImageObj.onload = () => {
          // Reset transformation states
          this.isFlipped = false;
          this.scaleFactor = 0.2;
          this.rotateDegree = 0;

          // Draw the image once it's loaded
          this.drawImageOnCanvas(this.scaleFactor);
        };
        this.uploadedImageObj.onerror = () => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load the uploaded image.',
          });
        };
      }

      // **Clear the input value to allow re-selection of the same file**
      input.value = '';
    }
  }

  onChangeImage(): void {
    // Reset image-related properties
    this.selectedFile = null;
    this.imageInFrame = null;
    this.uploadedImageObj = null;
    this.isFlipped = false;
    this.scaleFactor = 0.2;
    this.rotateDegree = 0;
    this.checkUpload = false;

    // Clear the canvas
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Redraw the frame (background image)
    this.drawImageOnCanvas(this.scaleFactor);
  }

  validateFile(file: File): boolean {
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert('Only PNG, JPEG, JPG, and GIF files are supported.');
      return false;
    }
    return true;
  }

  loadFrame(): void {
    if (this.guidelineUrl) {
      this.frameService.getFrameByGuidelineUrl(this.guidelineUrl).subscribe({
        next: frame => {
          this.frame = frame;
          const creatorId = frame.creator?.id;
          if (creatorId !== undefined) {
            this.accountService.getAccountById(creatorId).subscribe({
              next: account => {
                this.getAccount = account;
              },
              error: () => {
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'Failed to load account details.',
                });
                this.getAccount = null; // Reset if failed
              },
            });
          }
          this.publicUrl = frame.imagePath!;
          if (this.frame.description) {
            this.checkFrameTypeAndSetDetails(this.frame.description);
          }

          // Preload and cache the background image
          if (this.publicUrl) {
            this.backgroundImageObj = new Image();
            this.backgroundImageObj.src = this.publicUrl;
            this.backgroundImageObj.onload = () => {
              // Draw the canvas once the background image is loaded
              this.drawImageOnCanvas(this.scaleFactor);
            };
            this.backgroundImageObj.onerror = () => {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load the background image.',
              });
            };
          }
        },
        error() {
          Swal.fire({
            icon: 'warning',
            title: 'Warning',
            text: 'Cannot find this Frame.',
          });
        },
      });
    }
  }

  checkFrameTypeAndSetDetails(type: string): void {
    const typeDetailsMap: Record<string, { label: string; color: string; className: string }> = {
      [`Sự kiện`]: { label: 'Sự kiện', color: '#007bff', className: 'type-event' },
      [`Hoạt động`]: { label: 'Hoạt động', color: '#28a745', className: 'type-activity' },
      [`Chiến dịch`]: { label: 'Chiến dịch', color: '#dc3545', className: 'type-campaign' },
      [`Lễ hội`]: { label: 'Lễ hội', color: '#6f42c1', className: 'type-festival' },
      [`Khác`]: { label: 'Khác', color: '#6c757d', className: 'type-other' },
    };

    const typeDetails = typeDetailsMap[type];
    this.selectedTypeText = typeDetails.label;
    this.selectedTypeColor = typeDetails.color;
    this.typeClass = typeDetails.className;
  }

  onZoomChange(): void {
    this.drawImageOnCanvas(this.scaleFactor);
  }

  onZoomIn(): void {
    if (this.scaleFactor < 2) {
      this.scaleFactor += 0.1;
      this.drawImageOnCanvas(this.scaleFactor);
    }
  }

  onZoomOut(): void {
    if (this.scaleFactor > 0.1) {
      this.scaleFactor -= 0.1;
      this.drawImageOnCanvas(this.scaleFactor);
    }
  }

  onRotateLeft(): void {
    this.rotateDegree -= 15; // Rotate left by 15 degrees
    if (this.rotateDegree < 0) this.rotateDegree += 360; // Keep angle within [0, 360]
    this.drawImageOnCanvas(this.scaleFactor);
  }

  onRotateRight(): void {
    this.rotateDegree += 15; // Rotate right by 15 degrees
    if (this.rotateDegree >= 360) this.rotateDegree -= 360; // Keep angle within [0, 360]
    this.drawImageOnCanvas(this.scaleFactor);
  }

  onRotateChange(): void {
    // Called when the slider value changes
    this.drawImageOnCanvas(this.scaleFactor);
  }

  onFlipped(): void {
    this.isFlipped = !this.isFlipped;
    this.drawImageOnCanvas(this.scaleFactor);
  }

  onReset(): void {
    this.scaleFactor = 0.2;
    this.rotateDegree = 0;
    this.isFlipped = false;
    this.drawImageOnCanvas(this.scaleFactor);
  }

  drawImageOnCanvas(scale: number): void {
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'white'; // Fill color set to white
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // Draw the uploaded image (if available)
      if (this.uploadedImageObj) {
        const uploadedImage = this.uploadedImageObj;
        const imgScaleFactor = Math.min(canvas.width / uploadedImage.width, canvas.height / uploadedImage.height) * scale;
        const imgWidth = uploadedImage.width * imgScaleFactor;
        const imgHeight = uploadedImage.height * imgScaleFactor;

        // Convert rotation degree to radians
        const rotationAngle = (this.rotateDegree * Math.PI) / 180;

        // Save the current context state
        ctx.save();

        // Move to the center of the canvas
        ctx.translate(canvas.width / 2, canvas.height / 2);

        // Flip image
        if (this.isFlipped) {
          ctx.scale(-1, 1); // Flip horizontally
        }

        // Rotate the canvas context
        ctx.rotate(rotationAngle);

        // Draw the image centered at the origin
        ctx.drawImage(uploadedImage, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight);

        // Restore the context to its original state
        ctx.restore();
      }

      // Draw the background/frame on top
      if (this.backgroundImageObj) {
        this.drawBackgroundImage(ctx, canvas);
      }
    }
  }

  changeStep3(): void {
    this.currentStep = 3;
    this.isDownload = true;
  }
  changeStep2(): void {
    this.currentStep = 2;
    this.isDownload = false;
  }

  downloadImage(): void {
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Set a white background on the canvas before downloading
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Redraw the frame and image on the canvas with a white background
      this.drawImageOnCanvas(this.scaleFactor);

      // Create a data URL from the canvas
      const dataURL = canvas.toDataURL('image/png');

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'image_with_white_background.png'; // You can specify a custom filename
      link.click();
    }
  }

  private drawBackgroundImage(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    if (this.backgroundImageObj) {
      const backgroundImage = this.backgroundImageObj;
      const bgScaleFactor = Math.min(canvas.width / backgroundImage.width, canvas.height / backgroundImage.height);
      const bgWidth = backgroundImage.width * bgScaleFactor;
      const bgHeight = backgroundImage.height * bgScaleFactor;
      const bgX = (canvas.width - bgWidth) / 2;
      const bgY = (canvas.height - bgHeight) / 2;

      // Draw the background/frame image
      ctx.drawImage(backgroundImage, bgX, bgY, bgWidth, bgHeight);
    }
  }
}
