import dayjs from 'dayjs/esm';

import { IAdvertisement, NewAdvertisement } from './advertisement.model';

export const sampleWithRequiredData: IAdvertisement = {
  id: 25097,
  brand: 'next',
  imagePath: 'shyly short-term',
  redirectUrl: 'fray decriminalize language',
  active: true,
};

export const sampleWithPartialData: IAdvertisement = {
  id: 18203,
  brand: 'drain hmph',
  imagePath: 'lazily afore',
  redirectUrl: 'free how',
  active: true,
  updatedAt: dayjs('2024-10-13T14:32'),
};

export const sampleWithFullData: IAdvertisement = {
  id: 888,
  brand: 'dime upbeat',
  imagePath: 'oh electronics',
  redirectUrl: 'as expansion',
  active: true,
  createdAt: dayjs('2024-10-14T04:23'),
  updatedAt: dayjs('2024-10-14T04:33'),
};

export const sampleWithNewData: NewAdvertisement = {
  brand: 'victoriously mousse cautiously',
  imagePath: 'gigantic hm luck',
  redirectUrl: 'below sting stiffen',
  active: false,
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
