import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AlertError } from 'app/shared/alert/alert-error.model';
import { EventManager, EventWithContent } from 'app/core/util/event-manager.service';
import { DataUtils, FileLoadError } from 'app/core/util/data-util.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { FrameType } from 'app/entities/enumerations/frame-type.model';
import { FrameService } from '../service/frame.service';
import { IFrame } from '../frame.model';
import { FrameFormGroup, FrameFormService } from './frame-form.service';

@Component({
  standalone: true,
  selector: 'jhi-frame-update',
  templateUrl: './frame-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class FrameUpdateComponent implements OnInit {
  isSaving = false;
  frame: IFrame | null = null;
  frameTypeValues = Object.keys(FrameType);

  usersSharedCollection: IUser[] = [];

  protected dataUtils = inject(DataUtils);
  protected eventManager = inject(EventManager);
  protected frameService = inject(FrameService);
  protected frameFormService = inject(FrameFormService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: FrameFormGroup = this.frameFormService.createFrameFormGroup();

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ frame }) => {
      this.frame = frame;
      if (frame) {
        this.updateForm(frame);
      }

      this.loadRelationshipsOptions();
    });
  }

  byteSize(base64String: string): string {
    return this.dataUtils.byteSize(base64String);
  }

  openFile(base64String: string, contentType: string | null | undefined): void {
    this.dataUtils.openFile(base64String, contentType);
  }

  setFileData(event: Event, field: string, isImage: boolean): void {
    this.dataUtils.loadFileToForm(event, this.editForm, field, isImage).subscribe({
      error: (err: FileLoadError) =>
        this.eventManager.broadcast(new EventWithContent<AlertError>('pictureFrameApp.error', { ...err, key: `error.file.${err.key}` })),
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const frame = this.frameFormService.getFrame(this.editForm);
    if (frame.id !== null) {
      this.subscribeToSaveResponse(this.frameService.update(frame));
    } else {
      this.subscribeToSaveResponse(this.frameService.create(frame));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<IFrame>>): void {
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

  protected updateForm(frame: IFrame): void {
    this.frame = frame;
    this.frameFormService.resetForm(this.editForm, frame);

    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, frame.creator);
  }

  protected loadRelationshipsOptions(): void {
    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.frame?.creator)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
