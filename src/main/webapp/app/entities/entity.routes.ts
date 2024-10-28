import { Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'authority',
    data: { pageTitle: 'pictureFrameApp.adminAuthority.home.title' },
    loadChildren: () => import('./admin/authority/authority.routes'),
  },
  {
    path: 'advertisement',
    data: { pageTitle: 'pictureFrameApp.advertisement.home.title' },
    loadChildren: () => import('./advertisement/advertisement.routes'),
  },
  {
    path: 'category',
    data: { pageTitle: 'pictureFrameApp.category.home.title' },
    loadChildren: () => import('./category/category.routes'),
  },
  {
    path: 'frame',
    data: { pageTitle: 'pictureFrameApp.frame.home.title' },
    loadChildren: () => import('./frame/frame.routes'),
  },
  {
    path: 'transaction',
    data: { pageTitle: 'pictureFrameApp.transaction.home.title' },
    loadChildren: () => import('./transaction/transaction.routes'),
  },
  /* jhipster-needle-add-entity-route - JHipster will add entity modules routes here */
];

export default routes;
