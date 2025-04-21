import { Component, HostListener, ViewChild, ElementRef, AfterViewInit, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFrame, NewFrame } from '../../entities/frame/frame.model';
import { FrameService, ImageDTO } from '../../entities/frame/service/frame.service';
import { ActivatedRoute } from '@angular/router';
import dayjs, { Dayjs } from 'dayjs/esm';
import { AccountService } from '../../core/auth/account.service';
import { UserService } from '../../entities/user/service/user.service';
import { IUser } from '../../entities/user/user.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
@Component({
  standalone: true,
  templateUrl: './update-frame.component.html',
  styleUrls: ['./update-frame.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class UpdateFrameComponent implements OnInit, AfterViewInit {
  loading = false;
  isSticky = false;
  selectedFile: File | null = null;
  checkUpload = false;
  frameImageUrl: string | null = null;
  currentStep = 1;
  titleCanvas: string | null = null;
  type: string | null = null;
  selectedTypeText: string | null = null;
  selectedTypeColor: string | null = null;
  typeClass: string | null = null;
  isSaving = false;
  frame: IFrame | null = null;
  frames: IFrame[] = [];
  formGroup: FormGroup;
  account: string | null = null;
  creator: Pick<IUser, 'id' | 'login'> | null = null;

  @ViewChild('previewCanvas', { static: false }) previewCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('eventTypeBadge', { static: false }) eventTypeBadge!: ElementRef<HTMLSpanElement>;

  protected activeRoute = inject(ActivatedRoute);
  protected accountService = inject(AccountService);
  protected userService = inject(UserService);
  private isAccountFetched = false;

  constructor(
    private fb: FormBuilder,
    private frameService: FrameService, // Add this line to inject FrameService
    private router: Router,
  ) {
    this.formGroup = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(50)]],
      visibility: ['2', [Validators.required]], // Default to "Công khai"
      description: ['', [Validators.required]], // No default selected
      guidelineUrl: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    const offset = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.isSticky = offset > 100;
  }

  ngOnInit(): void {
    this.activeRoute.queryParams.subscribe(params => {
      const guidelineUrl = params['guidelineUrl'];
      if (guidelineUrl) {
        this.frameService.getFrameByGuidelineUrl(guidelineUrl).subscribe({
          next: frame => {
            this.frame = frame;

            // Update the form fields with the frame's values
            this.formGroup.patchValue({
              title: frame.title,
              description: frame.description,
              guidelineUrl: frame.guidelineUrl, // Map frame.guideline_url to guidelineUrl form control
            });

            this.frameImageUrl = frame.imagePath!;
            this.titleCanvas = frame.title!;
            this.type = frame.description!;
            this.checkUpload = !this.checkUpload;
            this.updateSelectedTypeDetals();
            this.drawImageOnCanvas();
          },
          error() {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to retrieve the frame. Please try again.',
            });
          },
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No guideline URL found. Unable to retrieve frame data.',
        });
      }
    });
  }

  ngAfterViewInit(): void {
    if (!this.isAccountFetched) {
      this.accountService.identity().subscribe({
        next: account => {
          this.account = account?.login ?? '';
          this.isAccountFetched = true; // Mark as fetched to prevent re-fetching
        },
      });
    }
  }

  onAddFrame(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.checkUpload = true;
      if (this.validateFile(file)) {
        this.selectedFile = file;
        this.frameImageUrl = URL.createObjectURL(file);
        // Only call drawImageOnCanvas if previewCanvas has already been initialized
        this.drawImageOnCanvas();
      }
      input.value = ''; // Clear the input value to allow re-selection of the same file
    }
  }

  validateFile(file: File): boolean {
    const validTypes = ['image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Only PNG files are supported.');
      return false;
    }
    return true;
  }

  deleteImage(): void {
    this.frameImageUrl = null;
    this.checkUpload = false;
    this.selectedFile = null;
    // Clear the canvas
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    this.currentStep = 1;
  }

  goToStep2(): void {
    if (this.frameImageUrl == null) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Please, Add Frame!!!',
      });
    } else {
      this.currentStep = 2;
    }
  }

  goBackStep1(): void {
    this.currentStep = 1;
  }

  // Function to update the title value:
  onTitleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.titleCanvas = input.value;
    this.drawImageOnCanvas(); // Re-render canvas with the updated title
  }

  onTypeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.type = select.value;
    this.updateSelectedTypeDetals(); // Update type text, color, and class
    this.updateBadge(); // Update the badge display
    this.drawImageOnCanvas(); // Redraw the canvas to show the updated content
  }

  updateSelectedTypeDetals(): void {
    const typeDetailsMap: Record<string, { label: string; color: string; className: string }> = {
      [`Sự kiện`]: { label: 'Sự kiện', color: '#007bff', className: 'type-event' },
      [`Hoạt động`]: { label: 'Hoạt động', color: '#28a745', className: 'type-activity' },
      [`Chiến dịch`]: { label: 'Chiến dịch', color: '#dc3545', className: 'type-campaign' },
      [`Lễ hội`]: { label: 'Lễ hội', color: '#6f42c1', className: 'type-festival' },
      [`Khác`]: { label: 'Khác', color: '#6c757d', className: 'type-other' },
    };

    if (this.type) {
      const typeDetails = typeDetailsMap[this.type];
      this.selectedTypeText = typeDetails.label;
      this.selectedTypeColor = typeDetails.color;
      this.typeClass = typeDetails.className;
    } else {
      this.selectedTypeText = null;
      this.selectedTypeColor = 'black';
      this.typeClass = null;
    }
  }

  drawImageOnCanvas(): void {
    const canvas = this.previewCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (this.frameImageUrl) {
        const image = new Image();
        image.src = this.frameImageUrl;
        image.onload = () => {
          // Draw the frame image
          const scaleFactor = Math.min(canvas.width / image.width, canvas.height / image.height);
          const x = (canvas.width - image.width * scaleFactor) / 2;
          const y = (canvas.height - image.height * scaleFactor) / 2;
          ctx.drawImage(image, x, y, image.width * scaleFactor, image.height * scaleFactor);

          // Draw the title
          if (this.titleCanvas) {
            ctx.font = '20px Arial';
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
          }
        };
      } else {
        // If no image, only draw the title
        if (this.titleCanvas) {
          ctx.font = '20px Arial';
          ctx.fillStyle = 'black';
          ctx.textAlign = 'center';
          ctx.fillText(this.titleCanvas, canvas.width / 2, canvas.height - 20);
        }
      }
    }
  }

  updateBadge(): void {
    // Ensure that the badge is updated in the preview area when the type changes
    const badgeElement = this.eventTypeBadge.nativeElement;
    badgeElement.textContent = this.selectedTypeText;
    badgeElement.style.backgroundColor = this.selectedTypeColor!;
    badgeElement.className = `badge rounded-pill event-type frame-type fw-bold w-auto mx-auto ${this.typeClass}`;
  }

  getCurrentTimestamp(): Dayjs {
    return dayjs(); // Returns the current timestamp as a Dayjs object
  }

  save(): void {
    this.loading = true;
    const formValue = this.formGroup.value;
    const guideline = formValue.guidelineUrl as string;

    // Check if the image has changed or not
    if (this.frameImageUrl === this.frame?.imagePath) {
      const idFrame: number = this.frame.id;
      const CreatedAt = this.frame.createdAt ? dayjs(this.frame.createdAt) : null;
      // Prepare the updated frame object
      const newFrame: IFrame = {
        id: idFrame,
        title: formValue.title,
        type: formValue.visibility,
        description: formValue.description,
        guidelineUrl: formValue.guidelineUrl,
        imagePath: this.frameImageUrl, // Use the existing image path
        usageCount: 0, // Keep the usage count
        createdAt: CreatedAt,
        updatedAt: this.getCurrentTimestamp(),
      };

      // Update the frame directly
      this.frameService.update(newFrame).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/frames']); // Navigate to home or the relevant page
        },
        error() {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to update the frame. Please try again.',
          });
        },
      });
    } else if (this.selectedFile) {
      // Handle new image upload
      const idFrame: number = this.frame?.id ?? 0;
      const ImagePath = this.frame?.imagePath ?? 'default-image-path';
      // Upload the selected file and get the public URL
      this.frameService.updateFrame(this.selectedFile, guideline, ImagePath).subscribe({
        next: (response: ImageDTO) => {
          const publicUrl = response.imageUrl;

          // Prepare the updated frame object with the new image URL
          const newFrame: IFrame = {
            id: idFrame,
            title: formValue.title,
            type: formValue.visibility,
            description: formValue.description,
            guidelineUrl: formValue.guidelineUrl,
            imagePath: publicUrl, // Use the new public URL
            usageCount: this.frame?.usageCount ?? 0,
            createdAt: this.frame?.createdAt,
            updatedAt: this.getCurrentTimestamp(),
          };

          // Update the frame with the new image
          this.frameService.update(newFrame).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/frames']);
            },
            error() {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to update the frame. Please try again.',
              });
            },
          });
        },
        error() {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to upload the image. Please try again.',
          });
        },
      });
    } else {
      // No image provided
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'No file selected. Please select an image to upload.',
      });
    }
  }
}
