import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IAdvertisement } from '../advertisement.model';
import { AdvertisementService } from '../service/advertisement.service';
import { AdvertisementFormGroup, AdvertisementFormService } from './advertisement-form.service';

@Component({
  standalone: true,
  selector: 'jhi-advertisement-update',
  templateUrl: './advertisement-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class AdvertisementUpdateComponent implements OnInit {
  isSaving = false;
  advertisement: IAdvertisement | null = null;

  protected advertisementService = inject(AdvertisementService);
  protected advertisementFormService = inject(AdvertisementFormService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: AdvertisementFormGroup = this.advertisementFormService.createAdvertisementFormGroup();

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ advertisement }) => {
      this.advertisement = advertisement;
      if (advertisement) {
        this.updateForm(advertisement);
      }
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const advertisement = this.advertisementFormService.getAdvertisement(this.editForm);
    if (advertisement.id !== null) {
      this.subscribeToSaveResponse(this.advertisementService.update(advertisement));
    } else {
      this.subscribeToSaveResponse(this.advertisementService.create(advertisement));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IAdvertisement>>): void {
    result.pipe(finalize(() => this.onSaveFinalize())).subscribe({
      next: () => this.onSaveSuccess(),
      error: () => this.onSaveError(),
    });
  }

  protected onSaveSuccess(): void {
    this.previousState();
  }

  protected onSaveError(): void {
    // Api for inheritance.
  }

  protected onSaveFinalize(): void {
    this.isSaving = false;
  }

  protected updateForm(advertisement: IAdvertisement): void {
    this.advertisement = advertisement;
    this.advertisementFormService.resetForm(this.editForm, advertisement);
  }
}
