import { Routes } from '@angular/router';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { ASC } from 'app/config/navigation.constants';
import FrameResolve from './route/frame-routing-resolve.service';

const frameRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/frame.component').then(m => m.FrameComponent),
    data: {
      defaultSort: `id,${ASC}`,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/view',
    loadComponent: () => import('./detail/frame-detail.component').then(m => m.FrameDetailComponent),
    resolve: {
      frame: FrameResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: 'new',
    loadComponent: () => import('./update/frame-update.component').then(m => m.FrameUpdateComponent),
    resolve: {
      frame: FrameResolve,
    },
    canActivate: [UserRouteAccessService],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./update/frame-update.component').then(m => m.FrameUpdateComponent),
    resolve: {
      frame: FrameResolve,
    },
    canActivate: [UserRouteAccessService],
  },
];

export default frameRoute;
