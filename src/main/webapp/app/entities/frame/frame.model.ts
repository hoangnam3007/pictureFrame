import dayjs from 'dayjs/esm';
import { IUser } from 'app/entities/user/user.model';
import { FrameType } from 'app/entities/enumerations/frame-type.model';

export interface IFrame {
  id: number;
  title?: string | null;
  type?: keyof typeof FrameType | null;
  description?: string | null;
  guidelineUrl?: string | null;
  imagePath?: string | null;
  usageCount?: number | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
  creator?: Pick<IUser, 'id' | 'login'> | null;
}

export type NewFrame = Omit<IFrame, 'id'> & { id: null };
