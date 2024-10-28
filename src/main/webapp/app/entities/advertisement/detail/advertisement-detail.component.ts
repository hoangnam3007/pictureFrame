import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';

import SharedModule from 'app/shared/shared.module';
import { DurationPipe, FormatMediumDatePipe, FormatMediumDatetimePipe } from 'app/shared/date';
import { IAdvertisement } from '../advertisement.model';

@Component({
  standalone: true,
  selector: 'jhi-advertisement-detail',
  templateUrl: './advertisement-detail.component.html',
  imports: [SharedModule, RouterModule, DurationPipe, FormatMediumDatetimePipe, FormatMediumDatePipe],
})
export class AdvertisementDetailComponent {
  advertisement = input<IAdvertisement | null>(null);

  previousState(): void {
    window.history.back();
  }
}
