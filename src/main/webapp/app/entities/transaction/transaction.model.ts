import dayjs from 'dayjs/esm';
import { IFrame } from 'app/entities/frame/frame.model';
import { IUser } from 'app/entities/user/user.model';

export interface ITransaction {
  id: number;
  usedAt?: dayjs.Dayjs | null;
  frame?: Pick<IFrame, 'id'> | null;
  user?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewTransaction = Omit<ITransaction, 'id'> & { id: null };
