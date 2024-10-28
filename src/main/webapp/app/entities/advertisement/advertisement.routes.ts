import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import AdvertisementResolve from './route/advertisement-routing-resolve.service';

const advertisementRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/advertisement.component').then(m => m.AdvertisementComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/advertisement-detail.component').then(m => m.AdvertisementDetailComponent),
    resolve: {
      advertisement: AdvertisementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/advertisement-update.component').then(m => m.AdvertisementUpdateComponent),
    resolve: {
      advertisement: AdvertisementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/advertisement-update.component').then(m => m.AdvertisementUpdateComponent),
    resolve: {
      advertisement: AdvertisementResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default advertisementRoute;
