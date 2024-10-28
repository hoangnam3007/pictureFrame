import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IFrame } from '../frame.model';
import { FrameService } from '../service/frame.service';

@Component({
  standalone: true,
  templateUrl: './frame-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class FrameDeleteDialogComponent {
  frame?: IFrame;

  protected frameService = inject(FrameService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.frameService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
