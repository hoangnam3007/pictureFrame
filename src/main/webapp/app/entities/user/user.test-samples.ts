import { IUser } from './user.model';

export const sampleWithRequiredData: IUser = {
  id: 21678,
  login: 'xbS8+I@q\\69',
};

export const sampleWithPartialData: IUser = {
  id: 19843,
  login: 'gf-VKt@m\\ggnLs\\SRgWBl3',
};

export const sampleWithFullData: IUser = {
  id: 22517,
  login: 'jsBi',
};
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
