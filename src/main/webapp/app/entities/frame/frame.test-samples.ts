import dayjs from 'dayjs/esm';

import { IFrame, NewFrame } from './frame.model';

export const sampleWithRequiredData: IFrame = {
  id: 1433,
  title: 'rebuild',
  type: 'RESTRICTED',
  imagePath: 'part atop',
};

export const sampleWithPartialData: IFrame = {
  id: 4490,
  title: 'huzzah than',
  type: 'PUBLIC',
  guidelineUrl: 'now whimsical degenerate',
  imagePath: 'voluntarily woot puzzled',
  usageCount: 23439,
};

export const sampleWithFullData: IFrame = {
  id: 27056,
  title: 'aha frugal',
  type: 'PRIVATE',
  description: '../fake-data/blob/hipster.txt',
  guidelineUrl: 'coarse',
  imagePath: 'somber',
  usageCount: 1113,
  createdAt: dayjs('2024-10-13T20:13'),
  updatedAt: dayjs('2024-10-14T08:58'),
};

export const sampleWithNewData: NewFrame = {
  title: 'howl valuable',
  type: 'PUBLIC',
  imagePath: 'barring aboard',
  id: null,
};

Object.freeze(sampleWithNewData);
Object.freeze(sampleWithRequiredData);
Object.freeze(sampleWithPartialData);
Object.freeze(sampleWithFullData);
