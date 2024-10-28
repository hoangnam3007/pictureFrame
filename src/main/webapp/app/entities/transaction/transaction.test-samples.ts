import dayjs from 'dayjs/esm';

import { ITransaction, NewTransaction } from './transaction.model';

export const sampleWithRequiredData: ITransaction = {
  id: 11976,
};

export const sampleWithPartialData: ITransaction = {
  id: 3142,
  usedAt: dayjs('2024-10-13T18:26'),
};

export const sampleWithFullData: ITransaction = {
  id: 27875,
  usedAt: dayjs('2024-10-14T05:20'),
};

export const sampleWithNewData: NewTransaction = {
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
