import { Component, HostListener, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IFrame, NewFrame } from '../entities/frame/frame.model';
import { FrameService, ImageDTO } from '../entities/frame/service/frame.service';
import { ActivatedRoute } from '@angular/router';
import { FrameType } from '../entities/enumerations/frame-type.model';
import dayjs, { Dayjs } from 'dayjs/esm';
import { AccountService } from '../core/auth/account.service';
import { UserService } from '../entities/user/service/user.service';
import { IUser } from '../entities/user/user.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { EditFrameComponent } from '../create-frame/edit-frame/edit-frame.component';
import { debounceTime, switchMap, distinctUntilChanged, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
@Component({
  standalone: true,
  templateUrl: './create-frame.component.html',
  styleUrls: ['./create-frame.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class CreateFrameComponent implements AfterViewInit {
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
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
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

  ngAfterViewInit(): void {
    if (!this.isAccountFetched) {
      this.accountService.identity().subscribe({
        next: account => {
          this.account = account?.login ?? '';
          this.isAccountFetched = true;
        },
      });

      this.frameService.getFrameByDate().subscribe({
        next: frames => {
          this.frames = frames;
        },
      });

      this.formGroup
        .get('guidelineUrl')
        ?.valueChanges.pipe(
          debounceTime(1500),
          distinctUntilChanged(),
          switchMap((url: string) => this.frameService.checkExistedByUrl(url)),
          catchError(() => of(false)),
        )
        .subscribe(urlExists => {
          if (urlExists) {
            this.formGroup.get('guidelineUrl')?.setErrors({ urlExist: true });
          } else {
            this.formGroup.get('guidelineUrl')?.setErrors(null);
          }
        });
    }

    this.drawImageOnCanvas();
  }

  onAddFrame(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.checkUpload = true;

      if (this.validateFile(file)) {
        // Check if the image dimensions are at least 512x512px
        const image = new Image();
        const reader = new FileReader();
        reader.onload = () => {
          image.src = reader.result as string;

          image.onload = () => {
            const width = image.width;
            const height = image.height;

            if (width < 512 || height < 512) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Image dimensions must be at least 512px.',
              });
              this.checkUpload = false;
              this.selectedFile = null;
            } else {
              // If valid, proceed with uploading and rendering the image
              this.selectedFile = file;
              this.frameImageUrl = URL.createObjectURL(file);
              this.drawImageOnCanvas(); // Only call drawImageOnCanvas if previewCanvas has already been initialized
            }
          };
        };
        reader.readAsDataURL(file);
      } else {
        // If the file type is invalid, reset the form and go back to Step 1
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Only PNG files are supported.',
        });
        this.currentStep = 1; // Redirect back to Step 1 if invalid file type
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
    if (this.selectedFile == null) {
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
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
    this.loading = true;
    const formValue = this.formGroup.value;
    const guideline = formValue.guidelineUrl as string;
    // Upload the image first to get its public URL
    if (this.selectedFile) {
      this.frameService.createFrame(this.selectedFile, guideline).subscribe({
        next: (response: ImageDTO) => {
          const publicUrl = response.imageUrl; // Get the public URL of the image
          // After uploading the image, save the frame
          this.userService.getUserByLogin(this.account!).subscribe({
            next: (user: IUser) => {
              this.creator = { id: user.id, login: user.login };

              const newFrame: NewFrame = {
                id: null,
                title: formValue.title,
                type: formValue.visibility,
                description: formValue.description,
                guidelineUrl: formValue.guidelineUrl,
                imagePath: publicUrl, // Use the public URL here
                usageCount: 0,
                createdAt: this.getCurrentTimestamp(),
                updatedAt: this.getCurrentTimestamp(),
                creator: this.creator,
              };

              // Save the frame with the public URL
              this.frameService.create(newFrame).subscribe({
                next: () => {
                  this.router.navigate(['/edit-frame'], {
                    queryParams: { guidelineUrl: newFrame.guidelineUrl },
                  });
                  this.loading = false;
                },
                error() {
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to save the frame. Please try again.',
                  });
                },
              });
            },
            error() {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Unable to fetch user information.',
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
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'No file selected. Please select an image to upload.',
      });
    }
  }

  onEditFrame(guidelineUrl: string): void {
    this.router.navigate(['/update-frame'], { queryParams: { guidelineUrl } });
  }
}
