import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import SharedModule from 'app/shared/shared.module';
import { ITEM_DELETED_EVENT } from 'app/config/navigation.constants';
import { IAdvertisement } from '../advertisement.model';
import { AdvertisementService } from '../service/advertisement.service';

@Component({
  standalone: true,
  templateUrl: './advertisement-delete-dialog.component.html',
  imports: [SharedModule, FormsModule],
})
export class AdvertisementDeleteDialogComponent {
  advertisement?: IAdvertisement;

  protected advertisementService = inject(AdvertisementService);
  protected activeModal = inject(NgbActiveModal);

  cancel(): void {
    this.activeModal.dismiss();
  }

  confirmDelete(id: number): void {
    this.advertisementService.delete(id).subscribe(() => {
      this.activeModal.close(ITEM_DELETED_EVENT);
    });
  }
}
