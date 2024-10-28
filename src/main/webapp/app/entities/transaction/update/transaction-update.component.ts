import { Component, OnInit, inject } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

import SharedModule from 'app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IFrame } from 'app/entities/frame/frame.model';
import { FrameService } from 'app/entities/frame/service/frame.service';
import { IUser } from 'app/entities/user/user.model';
import { UserService } from 'app/entities/user/service/user.service';
import { TransactionService } from '../service/transaction.service';
import { ITransaction } from '../transaction.model';
import { TransactionFormGroup, TransactionFormService } from './transaction-form.service';

@Component({
  standalone: true,
  selector: 'jhi-transaction-update',
  templateUrl: './transaction-update.component.html',
  imports: [SharedModule, FormsModule, ReactiveFormsModule],
})
export class TransactionUpdateComponent implements OnInit {
  isSaving = false;
  transaction: ITransaction | null = null;

  framesSharedCollection: IFrame[] = [];
  usersSharedCollection: IUser[] = [];

  protected transactionService = inject(TransactionService);
  protected transactionFormService = inject(TransactionFormService);
  protected frameService = inject(FrameService);
  protected userService = inject(UserService);
  protected activatedRoute = inject(ActivatedRoute);

  // eslint-disable-next-line @typescript-eslint/member-ordering
  editForm: TransactionFormGroup = this.transactionFormService.createTransactionFormGroup();

  compareFrame = (o1: IFrame | null, o2: IFrame | null): boolean => this.frameService.compareFrame(o1, o2);

  compareUser = (o1: IUser | null, o2: IUser | null): boolean => this.userService.compareUser(o1, o2);

  ngOnInit(): void {
    this.activatedRoute.data.subscribe(({ transaction }) => {
      this.transaction = transaction;
      if (transaction) {
        this.updateForm(transaction);
      }

      this.loadRelationshipsOptions();
    });
  }

  previousState(): void {
    window.history.back();
  }

  save(): void {
    this.isSaving = true;
    const transaction = this.transactionFormService.getTransaction(this.editForm);
    if (transaction.id !== null) {
      this.subscribeToSaveResponse(this.transactionService.update(transaction));
    } else {
      this.subscribeToSaveResponse(this.transactionService.create(transaction));
    }
  }

  protected subscribeToSaveResponse(result: Observable<HttpResponse<ITransaction>>): void {
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

  protected updateForm(transaction: ITransaction): void {
    this.transaction = transaction;
    this.transactionFormService.resetForm(this.editForm, transaction);

    this.framesSharedCollection = this.frameService.addFrameToCollectionIfMissing<IFrame>(this.framesSharedCollection, transaction.frame);
    this.usersSharedCollection = this.userService.addUserToCollectionIfMissing<IUser>(this.usersSharedCollection, transaction.user);
  }

  protected loadRelationshipsOptions(): void {
    this.frameService
      .query()
      .pipe(map((res: HttpResponse<IFrame[]>) => res.body ?? []))
      .pipe(map((frames: IFrame[]) => this.frameService.addFrameToCollectionIfMissing<IFrame>(frames, this.transaction?.frame)))
      .subscribe((frames: IFrame[]) => (this.framesSharedCollection = frames));

    this.userService
      .query()
      .pipe(map((res: HttpResponse<IUser[]>) => res.body ?? []))
      .pipe(map((users: IUser[]) => this.userService.addUserToCollectionIfMissing<IUser>(users, this.transaction?.user)))
      .subscribe((users: IUser[]) => (this.usersSharedCollection = users));
  }
}
