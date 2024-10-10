import { IAuthority, NewAuthority } from './authority.model';

export const sampleWithRequiredData: IAuthority = {
  name: '0c8c169f-edec-448c-a632-92b56993f9f1',
};

export const sampleWithPartialData: IAuthority = {
  name: '8e6ba431-25f9-4c72-b9cd-e6873e244e91',
};

export const sampleWithFullData: IAuthority = {
  name: 'c3732e05-02a2-433b-83f8-d42e51b9263f',
};

export const sampleWithNewData: NewAuthority = {
  name: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
