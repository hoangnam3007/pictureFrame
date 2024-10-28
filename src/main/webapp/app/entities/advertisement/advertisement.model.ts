import dayjs from 'dayjs/esm';

export interface IAdvertisement {
  id: number;
  brand?: string | null;
  imagePath?: string | null;
  redirectUrl?: string | null;
  active?: boolean | null;
  createdAt?: dayjs.Dayjs | null;
  updatedAt?: dayjs.Dayjs | null;
}

export type NewAdvertisement = Omit<IAdvertisement, 'id'> & { id: null };
