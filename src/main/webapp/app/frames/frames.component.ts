import { Component, OnInit, NgZone } from '@angular/core';
import { IFrame } from '../entities/frame/frame.model';
import { Observable, Subscription, combineLatest, filter, tap } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Data, ParamMap, Router, RouterModule } from '@angular/router';
import { EntityArrayResponseType, FrameService } from '../entities/frame/service/frame.service';
import { ITEMS_PER_PAGE, PAGE_HEADER, TOTAL_COUNT_RESPONSE_HEADER } from 'app/config/pagination.constants';
import { CommonModule } from '@angular/common';
import { ItemCountComponent } from 'app/shared/pagination';
import SharedModule from 'app/shared/shared.module';
import Swal from 'sweetalert2';
import { DEFAULT_SORT_DATA, ITEM_DELETED_EVENT, SORT } from 'app/config/navigation.constants';
@Component({
  standalone: true,
  templateUrl: './frames.component.html',
  styleUrls: ['./frames.component.scss'],
  imports: [CommonModule, ItemCountComponent, SharedModule],
})
export class FramesComponent implements OnInit {
  frames: IFrame[] = [];
  subscription: Subscription | null = null;
  itemsPerPage = ITEMS_PER_PAGE;
  totalItems = 0;
  page = 1;
  isLoading = false;
  constructor(
    private frameService: FrameService,
    protected activatedRoute: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
  ) {}
  trackId = (item: IFrame): number => this.frameService.getFrameIdentifier(item);
  ngOnInit(): void {
    this.subscription = combineLatest([this.activatedRoute.queryParamMap, this.activatedRoute.data])
      .pipe(
        tap(([params, data]) => this.fillComponentAttributeFromRoute(params, data)),
        tap(() => this.load()),
      )
      .subscribe();
  }

  load(): void {
    this.queryBackend().subscribe({
      next: (res: EntityArrayResponseType) => {
        this.onResponseSuccess(res);
      },
    });
  }

  onEditFrame(guidelineUrl: string): void {
    this.router.navigate(['/update-frame'], { queryParams: { guidelineUrl } });
  }

  navigateToPage(page: number): void {
    this.handleNavigation(page);
  }

  delete(frame: IFrame): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this frame!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    }).then(result => {
      if (result.isConfirmed) {
        this.frameService.delete(frame.id).subscribe({
          next: () => {
            this.frameService.deleteUrl(frame.guidelineUrl!).subscribe();
            Swal.fire('Deleted!', 'The frame has been deleted.', 'success');
            this.load();
          },
          error() {
            Swal.fire('Error!', 'There was a problem deleting the frame.', 'error');
          },
        });
      }
    });
  }

  protected queryBackend(): Observable<EntityArrayResponseType> {
    const { page } = this;

    this.isLoading = true;
    const pageToLoad: number = page;
    const queryObject: any = {
      page: pageToLoad - 1,
      size: this.itemsPerPage,
      eagerload: true,
    };
    return this.frameService.query(queryObject).pipe(tap(() => (this.isLoading = false)));
  }

  protected onResponseSuccess(response: EntityArrayResponseType): void {
    this.fillComponentAttributesFromResponseHeader(response.headers);
    const dataFromBody = this.fillComponentAttributesFromResponseBody(response.body);
    this.frames = dataFromBody;
  }

  protected fillComponentAttributesFromResponseHeader(headers: HttpHeaders): void {
    this.totalItems = Number(headers.get(TOTAL_COUNT_RESPONSE_HEADER));
  }

  protected fillComponentAttributesFromResponseBody(data: IFrame[] | null): IFrame[] {
    return data ?? [];
  }

  protected fillComponentAttributeFromRoute(params: ParamMap, data: Data): void {
    const page = params.get(PAGE_HEADER);
    this.page = +(page ?? 1);
  }

  protected handleNavigation(page: number): void {
    const queryParamsObj = {
      page,
      size: this.itemsPerPage,
    };

    this.ngZone.run(() => {
      this.router.navigate(['./'], {
        relativeTo: this.activatedRoute,
        queryParams: queryParamsObj,
      });
    });
  }
}
