import { ICategory, NewCategory } from './category.model';

export const sampleWithRequiredData: ICategory = {
  id: 3295,
  name: 'juvenile',
};

export const sampleWithPartialData: ICategory = {
  id: 7625,
  name: 'mmm',
};

export const sampleWithFullData: ICategory = {
  id: 24895,
  name: 'pendant',
  description: '../fake-data/blob/hipster.txt',
};

export const sampleWithNewData: NewCategory = {
  name: 'midst fumigate',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
