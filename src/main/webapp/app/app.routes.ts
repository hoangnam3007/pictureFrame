import { Routes } from '@angular/router';

import { Authority } from 'app/config/authority.constants';

import { UserRouteAccessService } from 'app/core/auth/user-route-access.service';
import { errorRoute } from './layouts/error/error.route';

const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home/home.component'),
    title: 'home.title',
  },
  {
    path: '',
    loadComponent: () => import('./layouts/navbar/navbar.component'),
    outlet: 'navbar',
  },
  {
    path: 'admin',
    data: {
      authorities: [Authority.ADMIN],
    },
    canActivate: [UserRouteAccessService],
    loadChildren: () => import('./admin/admin.routes'),
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.route'),
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component'),
    title: 'login.title',
  },
  {
    path: '',
    loadChildren: () => import(`./entities/entity.routes`),
  },
  {
    path: 'remove-background',
    loadComponent: () => import('./remove-background/remove-background.component').then(m => m.RemoveBackgroundComponent),
    title: 'remove-background.title',
  },

  {
    path: 'compress-image',
    loadComponent: () => import('./compress-image/compress-image.component').then(m => m.CompressImageComponent),
    title: 'compress-image.title',
  },
  {
    path: 'resize-image',
    loadComponent: () => import('./resize-image/resize-image.component').then(m => m.ResizeImageComponent),
    title: 'resize-image.title',
  },
  {
    path: 'create-frame',
    loadComponent: () => import('./create-frame/create-frame.component').then(m => m.CreateFrameComponent),
    title: 'create-frame.title',
  },
  {
    path: 'edit-frame',
    loadComponent: () => import('./create-frame/edit-frame/edit-frame.component').then(m => m.EditFrameComponent),
    title: 'edit-frame.title',
  },
  {
    path: 'update-frame',
    loadComponent: () => import('./create-frame/update-frame/update-frame.component').then(m => m.UpdateFrameComponent),
    title: 'update-frame.title',
  },
  {
    path: 'frames',
    loadComponent: () => import('./frames/frames.component').then(m => m.FramesComponent),
    title: 'frames.title',
  },
  ...errorRoute,
];

export default routes;
